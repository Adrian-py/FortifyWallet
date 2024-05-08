import * as bitcoin from "bitcoinjs-lib";
import { BIP32Interface } from "bip32";
import * as ecc from "tiny-secp256k1";
import ECPairFactory from "ecpair";

const ECPair = ECPairFactory(ecc);
const network = bitcoin.networks.testnet;
const BLOCKYPHER_TOKEN = process.env.BLOCKCYPER_TOKEN;

async function retrieveWalletInfo(address: string) {
  try {
    return await fetch(
      "https://api.blockcypher.com/v1/btc/test3/addrs/" + address,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        if (res.status === 429)
          throw new Error("Too many requests, please try again later!");
        return res.json();
      })
      .then((res) => {
        console.log(res);
        return res;
      });
  } catch (err) {
    throw err;
  }
}

async function retrieveUtxos(address: string): Promise<any> {
  const blockstream_url = process.env.BLOCKSTREAM_PUBLIC_URL;
  if (!blockstream_url) throw new Error("Blockstream URL not found!");

  const url = blockstream_url + "/address/" + address + "/utxo";
  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      return res;
    });
}

async function retrieveTxHex(txid: string): Promise<string> {
  const blockstream_url = process.env.BLOCKSTREAM_PUBLIC_URL;
  if (!blockstream_url) throw new Error("Blockstream URL not found!");

  const url = blockstream_url + "/tx/" + txid + "/hex";
  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      return res.text();
    })
    .then((res) => {
      return res;
    });
}

async function createTransaction(
  source_address: string,
  destination_address: string,
  multisig_pubkeys: Buffer[],
  value: number
): Promise<string> {
  const m = 2; // 2 of 3 multisig or 2 of 2 multisig
  const redeemScript = bitcoin.payments.p2ms({
    m,
    pubkeys: multisig_pubkeys,
    network,
  });
  const fees = 10000; // 10000 satoshis for fees
  const payment = bitcoin.payments.p2sh({ redeem: redeemScript, network });
  const psbt = new bitcoin.Psbt({ network });
  const utxos = await retrieveUtxos(source_address);
  for (const utxo of utxos) {
    const rawTxHex = await retrieveTxHex(utxo.txid);
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      nonWitnessUtxo: Buffer.from(rawTxHex, "hex"),
      redeemScript: payment.redeem?.output,
    });
  }
  psbt.addOutput({
    address: destination_address,
    value: value,
  });
  psbt.addOutput({
    address: source_address,
    value:
      utxos.reduce((acc: number, utxo: any) => acc + utxo.value, 0) -
      value -
      fees,
  });

  return psbt.toBase64();
}

async function signTransaction(
  psbt: string,
  signer: BIP32Interface,
  input_index: number
) {
  try {
    const psbt_obj = bitcoin.Psbt.fromBase64(psbt);
    psbt_obj.signInput(input_index, signer);
    psbt_obj.validateSignaturesOfInput(
      input_index,
      (pubkey, msghash, sig): boolean =>
        ECPair.fromPublicKey(pubkey).verify(msghash, sig),
      signer.publicKey
    );

    return psbt_obj.toBase64();
  } catch (err) {
    throw err;
  }
}

async function validateAllSignaturesCompleted(psbt: string): Promise<boolean> {
  try {
    const psbt_obj = bitcoin.Psbt.fromBase64(psbt);
    if (psbt_obj.data.inputs[0].partialSig === undefined) return false;
    return psbt_obj.data.inputs[0].partialSig.length >= 2;
  } catch (err) {
    throw err;
  }
}

async function broadcastTransaction(signed_psbt: string) {
  try {
    const psbt_obj = bitcoin.Psbt.fromBase64(signed_psbt);
    await psbt_obj.finalizeAllInputs();
    const txhex = psbt_obj.extractTransaction().toHex();

    return await fetch(
      "https://api.blockcypher.com/v1/btc/test3/txs/push?token=" +
        BLOCKYPHER_TOKEN,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx: txhex,
        }),
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return res;
      });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export {
  retrieveWalletInfo,
  createTransaction,
  signTransaction,
  validateAllSignaturesCompleted,
  broadcastTransaction,
};
