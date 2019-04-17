const bcrypt = require('bcrypt');
const WavesAPI = require('@waves/waves-api');
const sha256 = require('crypto-js/sha256');
const User = require('../models/user');
const mail = require('../../mail');


exports.createUser = (req, res) => {
  bcrypt.hash('testing123', 10, (error, hash) => {
    if (error) {
      return res.status(500).json({
        error,
      });
    }
    const user = new User({
      email: req.body.email,
      password: hash,
      isVerified: 'false',
      verificationToken: sha256(req.body.email),
    });
    user.save((err, result) => {
      console.log(result);
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

// const createUser = (data, res) => {
//   bcrypt.hash('testing123', 10, (error, hash) => {
//     if (error) {
//       return res.status(500).json({
//         error,
//       });
//     }
//     const user = new User({
//       email: data.email,
//       password: hash,
//       isVerified: 'false',
//       verificationToken: sha256(data.email),
//     });
//     user.save((err) => {
//       if (err) {
//         console.log(err);
//       } else {
//         res.status(201).json({
//           message: 'User Created',
//         });
//       }
//     });
//   });
// };

exports.verifyEmail = (req, res, next) => {
  res.send(req.params.token);
  console.log(req.params);
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
// console.log(req)
  const Waves = WavesAPI.create(WavesAPI.TESTNET_CONFIG);

  // Waves.API

  // const elephantAccount = Waves.Seed.create();

  // To check the validity of tx we need public keys of Inal and Lena
  const scriptBody = `
    let elephantPubKey = base58'Fjj56hAcCmKBCrRS6RTBPaqx7WBzxWpJu7rxD9psaA6E' 


    match tx {
      case tx:DataTransaction =>
        if(sigVerify(tx.bodyBytes, tx.proofs[0], elephantPubKey)) then true else false
      case _ =>
        let elephantSigned   = if(sigVerify(tx.bodyBytes, tx.proofs[0], elephantPubKey)) then 1 else 0
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
    sender: '3MzzFFasjiDeHSxuF2HXF9TwrHEZmMyfmKM', // elephantAccount.address,
    senderPublicKey: 'Fjj56hAcCmKBCrRS6RTBPaqx7WBzxWpJu7rxD9psaA6E',
  });
  let setScriptTx;

  try {
    setScriptTx = await Waves.tools.createTransaction(Waves.constants.SET_SCRIPT_TX_NAME, setScriptObj);
  } catch (e) {
    console.log(e);
  }

  setScriptTx.addProof('AASqnpcfCte1Rjob6c9NmLA37ptBQF5QdQP8DLSFi6uZ');
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
  console.log(setScriptResult);

  res.send(setScriptResult);
};
