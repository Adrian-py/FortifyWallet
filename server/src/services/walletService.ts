import { MysqlError } from "mysql";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
import BIP32Factory from "bip32";
import * as bip39 from "bip39";
import crypto from "crypto";

import { db_connection } from "@db/init";
import WalletInterface from "@interfaces/walletInterface";

// const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);
const network = bitcoin.networks.testnet;
// const network = bitcoin.networks.bitcoin;

function getAddress(node: any): string {
  return (
    bitcoin.payments.p2pkh({ pubkey: node.publicKey, network }).address ?? ""
  );
}

async function initializeWallet(): Promise<WalletInterface> {
  const random_bytes = crypto.randomBytes(16).toString("hex");
  const mnemonic = bip39.entropyToMnemonic(random_bytes);
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  const walletMaster = bip32.fromSeed(seed, network);
  console.log(getAddress(walletMaster.derivePath("m/0'")));

  const wallet: WalletInterface = {
    user_id: "",
    pubkey: walletMaster.publicKey.toString("hex"),
    address: getAddress(walletMaster.derivePath("m/0'")),
  };

  return wallet;
}

async function retrieveWalletByUserId(
  user_id: string
): Promise<WalletInterface[]> {
  const WALLET_QUERY = "SELECT * FROM wallet WHERE user_id = " + user_id;
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

export { initializeWallet, retrieveWalletByUserId };