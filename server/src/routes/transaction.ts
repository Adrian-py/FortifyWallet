import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import tokenMiddleware from "@middleware/tokenMiddleware";
import {
  getAccountDepartment,
  hasPrivilegeToTransfer,
} from "@services/accountService";
import { checkPassword } from "@utils/authUtils";
import {
  derivePrivateKey,
  getMultisigPubKeys,
  retrieveAddressBalance,
  retrieveWalletByAccountId,
  retrieveWalletByAddress,
} from "@services/walletService";
import {
  broadcastTransaction,
  createTransaction,
  signTransaction,
  validateAllSignaturesCompleted,
} from "@services/blockchainService";
import {
  retrieveAllTransactions,
  retrieveTransactionsByWalletAddress,
  saveTransaction,
  retrieveTransactionByTransactionId,
  updatePSBT,
  updateTransactionStatus,
  retrieveActiveTransactionsByWalletAddress,
  updateTransactionBroadcastStatus,
  retrieveTransactionsByInitiatorId,
  retrieveTransactionsByDepartment,
} from "@services/transactionService";
import { saveTransactionApproval } from "@services/transactionApprovalService";
import { TransactionInterface } from "@interfaces/transactionInterface";

const app = express.Router();

app.use(tokenMiddleware);

app.get("/retrieve", async (req, res) => {
  const access_token = req.cookies.access_token;
  const account = jwt.decode(access_token) as JwtPayload;

  let transactions: any[] = [];
  if (account.role === "admin") {
    // if is admin, retrieve all transactions
    transactions = await retrieveAllTransactions(account.account_id);
  } else if (account.role === "head") {
    // if is head, retrieve all transactions from the department
    const account_department = await getAccountDepartment(account.account_id);
    transactions = await retrieveTransactionsByDepartment(
      account_department.department_id
    );
  } else {
    // if is members, retrieve only their own transactions
    transactions = await retrieveTransactionsByInitiatorId(account.account_id);
  }
  return res.status(200).json({
    status: 200,
    message: "Transactions retrieved successfully!",
    transactions: transactions,
  });
});

app.get("/retrieve/:txid", async (req, res) => {
  try {
    const { txid } = req.params;

    const transaction = await retrieveTransactionByTransactionId(txid);
    if (!transaction)
      return res.status(404).json({
        status: 404,
        message: "Transaction not found!",
      });

    return res.status(200).json({
      status: 200,
      message: "Transaction data retrieved successfully!",
      transaction: transaction,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Error retrieving transaction data!",
      error: err.message,
    });
  }
});

app.post("/transfer", async (req, res) => {
  const { source_address, target_address, value } = req.body;
  const access_token = req.cookies.access_token;
  const account = jwt.decode(access_token) as JwtPayload;

  // Check if there are any active transactions for the source address
  // If there are, return an error
  if (
    (await retrieveActiveTransactionsByWalletAddress(source_address)).length > 0
  )
    return res.status(400).json({
      message:
        "There is already an active transaction for the address. Multiple active transactions are not allowed to prevent double spending.",
    });

  // Check if account has privilege to transfer from the wallet
  if (!(await hasPrivilegeToTransfer(account.account_id, source_address)))
    return res.status(401).json({
      message: "Account is not authorized to spend from the address!",
    });

  // Check if account has sufficient balance to transfer
  const address_balance = await retrieveAddressBalance(source_address);
  const pending_transactions = await retrieveTransactionsByWalletAddress(
    source_address
  );
  const locked_balance = pending_transactions.reduce(
    (acc: number, transaction: TransactionInterface) =>
      acc + (transaction.value ?? 0),
    0
  );
  if (address_balance - locked_balance < value)
    return res.status(400).json({
      message: "Insufficient funds in the address!",
    });

  try {
    const initiator_wallet = await retrieveWalletByAddress(source_address);
    const multisig_pubkeys = await getMultisigPubKeys(
      initiator_wallet.pub_key ?? "",
      account.account_id,
      account.role
    );
    let partially_signed_transaction = await createTransaction(
      source_address,
      target_address,
      multisig_pubkeys,
      value
    );

    const transaction: TransactionInterface = {
      initiator_id: account.account_id,
      psbt: partially_signed_transaction,
      sender: source_address,
      recipient: target_address,
      num_signatures: 0,
      num_of_needed_signatures: 2,
      value: value,
      pending: 1,
      broadcasted: 0,
    };

    await saveTransaction(transaction);
    return res.status(200).json({
      status: 200,
      message: "Transaction created successfully!",
    });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({
      status: 400,
      message: "Error signing transaction",
      error: err.message,
    });
  }
});

app.post("/sign", async (req, res) => {
  const { password, transaction_id, sender_address } = req.body;
  const access_token = req.cookies.access_token;
  const account = jwt.decode(access_token) as JwtPayload;

  // Check if password is correct
  if (!(await checkPassword(account.account_id, password))) {
    return res.status(401).json({
      status: 401,
      message: "Incorrect password!",
    });
  }

  let signer_wallet;

  if (account.role === "admin") signer_wallet = await derivePrivateKey("");
  else {
    let wallet_info;
    if (account.role === "head") {
      wallet_info = (await retrieveWalletByAccountId(account.account_id))[0];
    } else {
      wallet_info = await retrieveWalletByAddress(sender_address);
    }
    if (!wallet_info)
      return res
        .status(404)
        .json({ status: 404, message: "Wallet not found!" });
    signer_wallet = await derivePrivateKey(wallet_info.derivation_path ?? "");
  }

  try {
    const psbt = await retrieveTransactionByTransactionId(transaction_id);
    const signed_psbt = await signTransaction(
      psbt[0].psbt ?? "",
      signer_wallet,
      0
    );

    // If all needed signatures are present, update the transaction status
    if ((psbt[0].num_signatures ?? -1) + 1 === psbt[0].num_of_needed_signatures)
      await updateTransactionStatus(transaction_id);
    await updatePSBT(transaction_id, signed_psbt);
    await saveTransactionApproval(transaction_id, account.account_id);

    return res.status(200).json({
      status: 200,
      message: "Transaction signed successfully!",
    });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({
      status: 400,
      message: "Error signing transaction",
      error: err.message,
    });
  }
});

app.post("/broadcast", async (req, res) => {
  const { password, transaction_id } = req.body;
  const access_token = req.cookies.access_token;
  const account = jwt.decode(access_token) as JwtPayload;

  // Check if password is correct
  if (!(await checkPassword(account.account_id, password))) {
    return res.status(401).json({
      status: 401,
      message: "Incorrect password!",
    });
  }

  try {
    const signed_psbt = (
      await retrieveTransactionByTransactionId(transaction_id)
    )[0].psbt;

    if (!signed_psbt)
      return res.status(404).json({
        status: 404,
        message: "Transaction not found!",
      });
    if (await validateAllSignaturesCompleted(signed_psbt)) {
      await broadcastTransaction(signed_psbt);
      await updateTransactionBroadcastStatus(transaction_id);
    }
    return res.status(200).json({
      status: 200,
      message:
        "Transaction broadcasted successfully! Await blockchain confirmation.",
    });
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({
      status: 400,
      message: "Error broadcasting transaction",
      error: err.message,
    });
  }
});

export default app;
