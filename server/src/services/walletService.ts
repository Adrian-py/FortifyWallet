import { MysqlError } from "mysql";
import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
import BIP32Factory, { BIP32Interface } from "bip32";
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

async function getMultisigPubKeys(
  public_key: string,
  account_id: string,
  account_role: string
): Promise<Buffer[]> {
  // Order of multisig_pubkeys: source_address, department_head (if initiator is member), master
  const multisig_pubkeys = [Buffer.from(public_key ?? "", "hex")];
  if (account_role === "member")
    multisig_pubkeys.push(
      Buffer.from(
        (await retrieveMemberDepartmentHeadPublicKey(account_id)) ?? "",
        "hex"
      )
    );
  multisig_pubkeys.push(Buffer.from(await retrieveMasterPublicKey(), "hex"));
  return multisig_pubkeys;
}

async function getP2SHAddress(multisig_pubkeys: Buffer[]): Promise<string> {
  let m = multisig_pubkeys.length - 1;
  if (m === 1) m = 2;
  console.log(multisig_pubkeys);

  return (
    bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2ms({
        m: m,
        pubkeys: multisig_pubkeys,
        network,
      }),
      network,
    }).address ?? ""
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

async function retrieveAddressBalance(address: string): Promise<number> {
  const API_URL = process.env.BLOCKSTREAM_PUBLIC_URL ?? "";
  return await fetch(API_URL + "/address/" + address, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      return res.chain_stats.funded_txo_sum;
    });
}

async function initializeWallet(): Promise<any> {
  try {
    const random_bytes = crypto.randomBytes(16).toString("hex");
    const mnemonic = bip39.entropyToMnemonic(random_bytes);
    const seed = bip39.mnemonicToSeedSync(mnemonic);

    const wallet = bip32.fromSeed(seed, network);
    const master = wallet.deriveHardened(44).deriveHardened(0); // Root wallet path: m/44'/0'

    return {
      public_key: master.publicKey,
      private_key: await encryptKey(master.toWIF()),
    };
  } catch (err) {
    console.error(err);
    throw new Error("Error: Failed to initialize wallet");
  }
}

async function deriveWallet(account_id: string, account_role: string) {
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

    let derivation_path = `m/44'/0'/${department_id}'/0/${address_index}`;

    const derived_child = root.derivePath(derivation_path);
    const multisig_pubkeys = await getMultisigPubKeys(
      derived_child.publicKey.toString("hex"),
      account_id,
      account_role
    );
    const address = await getP2SHAddress(multisig_pubkeys);
    const pub_key = derived_child.publicKey.toString("hex");

    const WALLET_QUERY = `INSERT INTO wallets (address, account_id, department_id, pub_key, derivation_path) VALUES ("${address}", ${account_id}, ${department_id}, "${pub_key}", "${derivation_path}")`;
    return new Promise((resolve, reject) => {
      db_connection.query(WALLET_QUERY, (err: MysqlError) => {
        if (err) reject(err);
        resolve({ address, owned_by: account_id, role: "user" });
      });
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function derivePrivateKey(
  derivationPath: string
): Promise<BIP32Interface> {
  try {
    const encryptedKey = await retrieveMasterKey();
    const privateKey = await decryptKey(encryptedKey);

    const key_pair = ECPair.fromWIF(privateKey, network);
    const root = bip32.fromPrivateKey(
      Buffer.from(key_pair.privateKey?.toString("hex") ?? "", "hex"),
      Buffer.alloc(32),
      network
    );
    if (derivationPath.length === 0) return root;

    return root.derivePath(derivationPath);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function retrieveNumberOfWalletsInDepartment(
  department_id: string
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
    const PRIVATE_KEY_QUERY = `SELECT private_key FROM company WHERE company_id = 1`;
    return new Promise((resolve, reject) => {
      {
        db_connection.query(PRIVATE_KEY_QUERY, (err: MysqlError, res: any) => {
          if (err) reject(err);
          resolve(res[0].private_key);
        });
      }
    });
  } catch (err) {
    console.error(err);
    throw new Error("Error: Failed to retrieve master key");
  }
}

async function retrieveMasterPublicKey(): Promise<string> {
  try {
    const PUBLIC_KEY_QUERY = `SELECT public_key FROM company WHERE company_id = 1`;
    return new Promise((resolve, reject) => {
      {
        db_connection.query(PUBLIC_KEY_QUERY, (err: MysqlError, res: any) => {
          if (err) reject(err);
          resolve(res[0].public_key);
        });
      }
    });
  } catch (err) {
    console.error(err);
    throw new Error("Error: Failed to retrieve master public key");
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
  department_id: string
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
    SELECT wallets.address, accounts.username AS owned_by, departments.department_name AS department,  wallets.derivation_path FROM wallets
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

async function retrieveWalletByAddress(
  address: string
): Promise<WalletInterface> {
  const WALLET_QUERY = `SELECT wallets.wallet_id, wallets.account_id, wallets.department_id, wallets.pub_key, wallets.derivation_path FROM wallets WHERE wallets.address = '${address}'`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      WALLET_QUERY,
      (err: MysqlError, res: WalletInterface[]) => {
        if (err) reject(err);
        resolve(res[0]);
      }
    );
  });
}

async function retrieveMemberDepartmentHeadPublicKey(
  account_id: string
): Promise<string> {
  const HEAD_QUERY = `
    SELECT * FROM wallets WHERE account_id = (SELECT account_id FROM accounts WHERE role_id = 2 AND department_id = (SELECT department_id FROM accounts WHERE account_id = '${account_id}'))
  `;
  return new Promise((resolve, reject) => {
    db_connection.query(HEAD_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res[0].pub_key);
    });
  });
}

export {
  initializeWallet,
  retrieveAddressBalance,
  deriveWallet,
  derivePrivateKey,
  getMultisigPubKeys,
  retrieveMasterKey,
  retrieveMasterPublicKey,
  retrieveAllDepartmentWallets,
  retrieveAllWallets,
  retrieveWalletByAccountId,
  retrieveWalletByAddress,
  retrieveMemberDepartmentHeadPublicKey,
};
