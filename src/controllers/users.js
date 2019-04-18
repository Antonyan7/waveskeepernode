const bcrypt = require('bcrypt');
const WavesAPI = require('@waves/waves-api');
const sha256 = require('crypto-js/sha256');
const User = require('../models/user');
const mail = require('../../mail');


const createUser = (email, res) => {
  bcrypt.hash('testing123', 10, (error, hash) => {
    if (error) {
      return res.status(500).json({
        error,
      });
    }
    const user = new User({
      email,
      password: hash,
      isVerified: 'false',
      verificationToken: sha256(email),
    });
    user.save((err, result) => {
      if (err) {
        console.log(err);
      } else {
        mail.main(result.verificationToken).catch(console.error);
        res.status(201).json({
          message: 'User Created',
        });
      }
    });
  });
};

exports.verifyEmail = (req, res, next) => {
  res.send(req.params.token);
  User.findOne({ verificationToken: req.params.token }, (err, user) => {
    if (err) {
      next(err);
    } else {
      req.user = user;
      res.status(201).json({
        message: 'User Created',
      });
      next();
    }
  });
};

exports.getAllUsers = (req, res, next) => {
  User.find((err, users) => {
    if (err) {
      return next(err);
    }
    return res.json(users);
  });
};

exports.createContract = async (req, res) => {

  const Waves = WavesAPI.create(WavesAPI.TESTNET_CONFIG);


  const scriptBody = `
    let serverPubKey = base58'${process.env.ACCOUNT_PUBLIC}'
    let userPubKey = base58'${req.body.publicKey}'

    match tx {
      case tx:DataTransaction =>
        if(sigVerify(tx.bodyBytes, tx.proofs[0], serverPubKey)) then true else false
      case _ =>
        let elephantSigned  = if(sigVerify(tx.bodyBytes, tx.proofs[0], serverPubKey)) then 1 else 0
        elephantSigned == 1
    }`;
  const compiledScript = await Waves.API.Node.utils.script.compile(scriptBody);

  // create instance of TransactionWrapper and add signature
  const setScriptObj = Object.assign({
    type: 12,
    version: 1,
    fee: 1400000,
  }, {
    script: compiledScript,
    sender: process.env.ACCOUNT_ADDRESS,
    senderPublicKey: process.env.ACCOUNT_PUBLIC,
  });
  let setScriptTx;

  try {
    setScriptTx = await Waves.tools.createTransaction(Waves.constants.SET_SCRIPT_TX_NAME, setScriptObj);
  } catch (e) {
    console.log(e);
  }

  setScriptTx.addProof(process.env.ACCOUNT_PRIVATE);

  let txJSON;

  try {
    txJSON = await setScriptTx.getJSON();
    await Waves.API.Node.transactions.rawBroadcast(txJSON);
  } catch (e) {
    console.log(e);
  }

  return createUser(req.body.email, res);
};
