require('dotenv').config()
const express = require('express')
// const WavesAPI = require('@waves/waves-api')
var app = express()
const path = require('path')
const usersRouter = require('./src/routes/users')
var mail = require('./mail')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://admin:' + process.env.MONGO_ATLAS_PASS +
  '@wavekeeper-s2crb.mongodb.net/test?retryWrites=true',
{ useNewUrlParser: true }).catch(err => console.log(err))
mongoose.set('useCreateIndex', true)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')))

app.use(usersRouter)
// app.get('/create-smart-contract', async function(req, res){
//     // console.log(req)
//     const Waves = WavesAPI.create(WavesAPI.TESTNET_CONFIG);
//
//     // Waves.API=
//
//     const elephantAccount = Waves.Seed.create();
//
//     // To check the validity of tx we need public keys of Inal and Lena
//     const lenaPubKey = '5XpeKMDVe1AMhuxUdB8dAg1Q26A9XFicvVQohxdcohSb';
//     const inalPubKey = 'EUxurMktqev3KzBPGD5hhMb6GtyGU2u7sTjaz9DoL73Y';
//     const scriptBody = `
//     let lenaPubKey     = base58'${lenaPubKey}'
//     let inalPubKey     = base58'${inalPubKey}'
//     let elephantPubKey = base58'${elephantAccount.keyPair.publicKey}'
//
//
//     match tx {
//       case tx:DataTransaction =>
//         if(sigVerify(tx.bodyBytes, tx.proofs[0], elephantPubKey)) then true else false
//       case _ =>
//         let elephantSigned   = if(sigVerify(tx.bodyBytes, tx.proofs[0], elephantPubKey)) then 1 else 0
//         let inalSigned       = if(sigVerify(tx.bodyBytes, tx.proofs[1], inalPubKey))     then 1 else 0
//         let lenaSigned       = if(sigVerify(tx.bodyBytes, tx.proofs[1], lenaPubKey))     then 1 else 0
//         elephantSigned == 1 && ((inalSigned + lenaSigned) > 0)
//     }`;
//     const compiledScript = await Waves.API.Node.utils.script.compile(scriptBody);
//
//     // create instance of TransactionWrapper and add signature
//     const setScriptObj = Object.assign(Helpers.TX_EXAMPLES.SET_SCRIPT, {
//         script: compiledScript,
//         sender: elephantAccount.address,
//         senderPublicKey: elephantAccount.keyPair.publicKey
//     });
//     const setScriptTx = await Waves.tools.createTransaction(Waves.constants.SET_SCRIPT_TX_NAME, setScriptObj);
//     setScriptTx.addProof(elephantAccount.keyPair.privateKey);
//     console.log(setScriptTx.getTxData());
//     try {
//         let a = await setScriptTx.getSignData();
//         console.log(a);
//     } catch (e) {
//         console.log("ERROR");
//         console.log(e);
//     }
//
//
//     // send SetScriptTransaction to the network
//     //to send tx we need TESTNET WAVES on Elephants' account
//     //you can get them in faucet: https://testnet.wavesexplorer.com/faucet
//     const txJSON = await setScriptTx.getJSON();
//     const setScriptResult = await Waves.API.Node.transactions.rawBroadcast(txJSON);
//
//     res.send(setScriptResult);
//
// });

app.get('/send', function (req, res) {
  mail.main().catch(console.error)
})

module.exports = app
