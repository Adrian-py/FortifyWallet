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
import { getAccountDepartment } from "./accountService";

const ECPair = ECPairFactory(ecc);
const kms = new KMSClient({
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});
const bip32 = BIP32Factory(ecc);
const network = bitcoin.networks.testnet;
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

async function initializeWallet(): Promise<string> {
  try {
    const random_bytes = crypto.randomBytes(16).toString("hex");
    const mnemonic = bip39.entropyToMnemonic(random_bytes);
    const seed = bip39.mnemonicToSeedSync(mnemonic);

    const wallet = bip32.fromSeed(seed, network);
    const master = wallet.deriveHardened(44).deriveHardened(0); // Root wallet path: m/44'/0'

    return await encryptKey(master.toWIF());
  } catch (err) {
    console.error(err);
    throw new Error("Error: Failed to initialize wallet");
  }
}

async function deriveWallet(account_id: string) {
  try {
    const encrypted_key = await retrieveMasterKey();
    const priv_key = await decryptKey(encrypted_key);

    const { department_id } = await getAccountDepartment(account_id);
    const address_index = await retrieveNumberOfWalletsInDepartment(
      department_id
    );

    const key_pair = ECPair.fromWIF(priv_key, network);
    const root = bip32.fromPrivateKey(
      Buffer.from(key_pair.privateKey?.toString("hex") ?? "", "hex"),
      Buffer.alloc(32),
      network
    );

    const derivation_path = `m/44'/0'/${department_id}'/0/${address_index}`;
    const derived_child = root.derivePath(derivation_path);
    const address = getAddress(derived_child);
    const pub_key = derived_child.publicKey.toString("hex");

    const WALLET_QUERY = `INSERT INTO wallets (address, account_id, department_id, pub_key, derivation_path) VALUES ("${address}", ${account_id}, ${department_id}, "${pub_key}", "${derivation_path}")`;
    return new Promise((resolve, reject) => {
      db_connection.query(WALLET_QUERY, (err: MysqlError) => {
        if (err) reject(err);
        resolve({ address, owned_by: account_id, role: "user" });
      });
    });
  } catch (err) {
    throw new Error("Error: Failed to derive wallet");
  }
}

async function retrieveNumberOfWalletsInDepartment(
  department_id: Number
): Promise<number> {
  const WALLET_QUERY = `SELECT COUNT(*) AS address_index FROM wallets WHERE department_id = ${department_id}`;
  return new Promise((resolve, reject) => {
    db_connection.query(WALLET_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res[0].address_index);
    });
  });
}

async function retrieveMasterKey(): Promise<string> {
  try {
    const MASTER_KEY_QUERY = `SELECT master_key FROM company WHERE company_id = 1`;
    return new Promise((resolve, reject) => {
      {
        db_connection.query(MASTER_KEY_QUERY, (err: MysqlError, res: any) => {
          if (err) reject(err);
          resolve(res[0].master_key);
        });
      }
    });
  } catch (err) {
    console.error(err);
    throw new Error("Error: Failed to retrieve master key");
  }
}

async function retrieveAllWallets(): Promise<WalletInterface[]> {
  const WALLET_QUERY = `
    SELECT wallets.address, accounts.username AS owned_by, departments.department_name as department FROM wallets
    INNER JOIN accounts ON wallets.account_id = accounts.account_id
    INNER JOIN departments ON wallets.department_id = departments.department_id
  `;
  return new Promise((resolve, reject) => {
    db_connection.query(
      WALLET_QUERY,
      (err: MysqlError, res: WalletInterface[]) => {
        if (err) reject(err);
        resolve(res);
      }
    );
  });
}

async function retrieveAllDepartmentWallets(
  department_id: Number
): Promise<WalletInterface[]> {
  const WALLET_QUERY = `
    SELECT wallets.address, accounts.username AS owned_by, departments.department_name as department FROM wallets
    INNER JOIN accounts ON wallets.account_id = accounts.account_id
    INNER JOIN departments ON wallets.department_id = departments.department_id
    WHERE wallets.department_id = ${department_id}
  `;
  return new Promise((resolve, reject) => {
    db_connection.query(
      WALLET_QUERY,
      (err: MysqlError, res: WalletInterface[]) => {
        if (err) reject(err);
        resolve(res);
      }
    );
  });
}

async function retrieveWalletByAccountId(
  account_id: string
): Promise<WalletInterface[]> {
  const WALLET_QUERY = `
    SELECT wallets.address, accounts.username AS owned_by, departments.department_name AS department FROM wallets 
    INNER JOIN accounts ON wallets.account_id = accounts.account_id 
    INNER JOIN departments ON wallets.department_id = departments.department_id
    WHERE wallets.account_id = ${account_id}`;
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

export {
  initializeWallet,
  deriveWallet,
  retrieveAllDepartmentWallets,
  retrieveAllWallets,
  retrieveWalletByAccountId,
};
