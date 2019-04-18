const bcrypt = require('bcrypt');
const WavesAPI = require('@waves/waves-api');
const User = require('../models/user');
require('dotenv').config();


const createUser = (email, res) => {
  bcrypt.hash('testing123', 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }
    const user = new User({
      email: email,
      password: hash,
      isVerified: 'false',
      verificationToken: '',
    });
    user.save((error) => {
      if (error) {
        console.log(error);
      } else {
        res.status(201).json({
          message: 'User Created',
        });
      }
    });
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
// console.log(req)
  const Waves = WavesAPI.create(WavesAPI.TESTNET_CONFIG);

  // Waves.API

  // const elephantAccount = Waves.Seed.create();

  // To check the validity of tx we need public keys of Inal and Lena
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
  // console.log(setScriptTx.getTxData());

  // send SetScriptTransaction to the network
  // to send tx we need TESTNET WAVES on Elephants' account
  // you can get them in faucet: https://testnet.wavesexplorer.com/faucet
  let txJSON;
  let setScriptResult;
  try {
    txJSON = await setScriptTx.getJSON();
    setScriptResult = await Waves.API.Node.transactions.rawBroadcast(txJSON);
  } catch (e) {
    console.log(e);
  }
  // console.log(setScriptResult);

  // res.send(setScriptResult);
  return createUser(req.body.email, res);
};
