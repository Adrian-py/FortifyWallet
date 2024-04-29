import { MysqlError } from "mysql";
import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
import BIP32Factory from "bip32";
import * as bip39 from "bip39";
import crypto from "crypto";

import { db_connection } from "@db/init";
import WalletInterface from "@interfaces/walletInterface";

// const ECPair = ECPairFactory(ecc);
const kms = new KMSClient({
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});
const bip32 = BIP32Factory(ecc);
const network = bitcoin.networks.bitcoin;
// const network = bitcoin.networks.bitcoin;

function getAddress(node: any): string {
  return (
    bitcoin.payments.p2pkh({ pubkey: node.publicKey, network }).address ?? ""
  );
}

async function encryptKey(key: string): Promise<string> {
  const kmsKeyId = process.env.KMS_KEY_ID;

  if (!kmsKeyId)
    throw new Error("KMS Key ID not found in environment variables");
  const command = new EncryptCommand({
    KeyId: kmsKeyId,
    Plaintext: new TextEncoder().encode(key),
  });
  const cipherText = await kms.send(command);
  return Buffer.from(cipherText.CiphertextBlob ?? "").toString("base64");
}

async function decryptKey(cipherText: string): Promise<string> {
  const kmsKeyId = process.env.KMS_KEY_ID;

  if (!kmsKeyId)
    throw new Error("KMS Key ID not found in environment variables");

  const command = new DecryptCommand({
    KeyId: kmsKeyId,
    CiphertextBlob: Uint8Array.from(atob(cipherText), (v) => v.charCodeAt(0)),
  });
  const decryptedBinaryData = await kms.send(command);
  return String.fromCharCode.apply(
    null,
    Array.from(
      new Uint16Array(decryptedBinaryData.Plaintext ?? new Uint8Array())
    )
  );
}

async function initializeWallet(): Promise<WalletInterface> {
  try {
    const random_bytes = crypto.randomBytes(16).toString("hex");
    const mnemonic = bip39.entropyToMnemonic(random_bytes);
    const seed = bip39.mnemonicToSeedSync(mnemonic);

    const wallet = bip32.fromSeed(seed, network);
    const master = wallet.deriveHardened(44).deriveHardened(0); // Root wallet path: m/44'/0'

    const wallet_info: WalletInterface = {
      account_id: "",
      priv_key: await encryptKey(master.toWIF()),
      pub_key: master.publicKey.toString("hex"),
      address: getAddress(master),
    };

    return wallet_info;
  } catch (err) {
    console.error(err);
    throw new Error("Error: Failed to initialize wallet");
  }
}

async function retrieveWalletByAccountId(
  account_id: string
): Promise<WalletInterface[]> {
  const WALLET_QUERY = "SELECT * FROM wallets WHERE account_id = " + account_id;
  return new Promise((resolve, reject) => {
    db_connection.query(
      WALLET_QUERY,
      (err: MysqlError, result: WalletInterface[]) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
}

export { initializeWallet, retrieveWalletByAccountId };
