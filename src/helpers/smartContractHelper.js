const WavesAPI = require('@waves/waves-api');

exports.createContract = async (publicKey) => {
  const Waves = WavesAPI.create(WavesAPI.TESTNET_CONFIG);


  const scriptBody = `
    let serverPubKey = base58'${process.env.ACCOUNT_PUBLIC}'
    let userPubKey = base58'${publicKey}'

    match tx {
      case tx:DataTransaction =>
        if(sigVerify(tx.bodyBytes, tx.proofs[0], serverPubKey)) then true else false
      case _ =>
        let elephantSigned  = if(sigVerify(tx.bodyBytes, tx.proofs[0], serverPubKey)) then 1 else 0
        elephantSigned == 1
    }`;
  const compiledScript = await Waves.API.Node.utils.script.compile(scriptBody);

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
};
