require('dotenv').config()
const express = require('express')
// const WavesAPI = require('@waves/waves-api')
var app = express()
const path = require('path')
const usersRouter = require('./src/routes/users')
var mail = require('./mail')
const WavesAPI = require('@waves/waves-api');
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

app.get('/create-smart-contract', async function (req, res) {
// console.log(req)
  const Waves = WavesAPI.create(WavesAPI.TESTNET_CONFIG)

  // Waves.API

  const elephantAccount = Waves.Seed.create()

  // To check the validity of tx we need public keys of Inal and Lena
  const lenaPubKey = 'HY4NeHugjDMv4U7bxMYc6kpamjNWDs7jKc7xwoUhCHhq'
  const inalPubKey = 'EUxurMktqev3KzBPGD5hhMb6GtyGU2u7sTjaz9DoL73Y'
  const scriptBody = `
    let lenaPubKey     = base58'${lenaPubKey}'
    let inalPubKey     = base58'${inalPubKey}'
    let elephantPubKey = base58'HY4NeHugjDMv4U7bxMYc6kpamjNWDs7jKc7xwoUhCHhq' 


    match tx {
      case tx:DataTransaction =>
        if(sigVerify(tx.bodyBytes, tx.proofs[0], elephantPubKey)) then true else false
      case _ =>
        let elephantSigned   = if(sigVerify(tx.bodyBytes, tx.proofs[0], elephantPubKey)) then 1 else 0
        let inalSigned       = if(sigVerify(tx.bodyBytes, tx.proofs[1], inalPubKey))     then 1 else 0
        let lenaSigned       = if(sigVerify(tx.bodyBytes, tx.proofs[1], lenaPubKey))     then 1 else 0
        elephantSigned == 1 && ((inalSigned + lenaSigned) > 0)
    }`
  const compiledScript = await Waves.API.Node.utils.script.compile(scriptBody)

  // create instance of TransactionWrapper and add signature
  const setScriptObj = Object.assign({
    'type': 12,
    'version': 1,
    'fee': 1000000
  }, {
    script: compiledScript,
    sender: '3N6Z2frXZH7tqDbF1U6NcP8mTTxiRaRt7nv', // elephantAccount.address,
    senderPublicKey: 'HY4NeHugjDMv4U7bxMYc6kpamjNWDs7jKc7xwoUhCHhq'
  })
  let setScriptTx

  try {
    setScriptTx = await Waves.tools.createTransaction(Waves.constants.SET_SCRIPT_TX_NAME, setScriptObj)
  } catch (e) {
    console.log(e)
  }

  setScriptTx.addProof('G87AhfgDvF4SBg6AEBmw7teywNxsB3L4p7VnBaChbrR2')
  // console.log(setScriptTx.getTxData());

  // send SetScriptTransaction to the network
  // to send tx we need TESTNET WAVES on Elephants' account
  // you can get them in faucet: https://testnet.wavesexplorer.com/faucet

  try {
    const txJSON = await setScriptTx.getJSON()
    const setScriptResult = await Waves.API.Node.transactions.rawBroadcast(txJSON)
  } catch (e) {
    console.log('ASDSD')
    console.log(e)
  }

  res.send(setScriptResult)
})

app.get('/send', function (req, res) {
  mail.main().catch(console.error)
})

module.exports = app
