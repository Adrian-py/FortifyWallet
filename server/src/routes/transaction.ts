import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import tokenMiddleware from "@middleware/tokenMiddleware";
import {
  getAccountDepartment,
  hasPrivilegeToTransfer,
} from "@services/accountService";
import {
  derivePrivateKey,
  getMultisigPubKeys,
  retrieveAddressBalance,
  retrieveMasterKey,
  retrieveMasterPublicKey,
  retrieveMemberDepartmentHeadPublicKey,
  retrieveWalletByAccountId,
  retrieveWalletByAddress,
} from "@services/walletService";
import {
  broadcastTransaction,
  createTransaction,
  signTransaction,
  validateAllSignaturesCompleted,
} from "@services/blockcypherService";
import {
  retrieveAllTransactions,
  retrieveTransactionsByInitiatorId,
  retrieveTransactionsByDepartment,
  retrieveTransactionsByWalletAddress,
  saveTransaction,
  retrieveTransactionByTransactionId,
  updatePSBT,
  updateTransactionStatus,
} from "@services/transactionService";
import TransactionInterface from "@interfaces/transactionInterface";
import { saveTransactionApproval } from "@services/transactionApprovalService";

const app = express.Router();

app.use(tokenMiddleware);

app.get("/retrieve", async (req, res) => {
  const access_token = req.cookies.access_token;
  const account = jwt.decode(access_token) as JwtPayload;

  let transactions: any[] = [];
  if (account.role === "admin") {
    transactions = await retrieveAllTransactions();
  } else if (account.role === "head") {
    const account_department = await getAccountDepartment(account.account_id);
    transactions = await retrieveTransactionsByDepartment(
      account_department.department_id
    );
  } else if (account.role === "member") {
    transactions = await retrieveTransactionsByInitiatorId(account.account_id);
  }
  return res.status(200).json({
    status: 200,
    message: "Transactions retrieved successfully!",
    transactions: transactions,
  });
});

app.get("/retrieve/:txid", async (req, res) => {
  const { txid } = req.params;
  const access_token = req.cookies.access_token;

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
});

app.post("/transfer", async (req, res) => {
  const { source_address, target_address, value } = req.body;
  const access_token = req.cookies.access_token;
  const account = jwt.decode(access_token) as JwtPayload;

  // Check if there are any active transactions for the source address
  // If there are, return an error
  if ((await retrieveTransactionsByWalletAddress(source_address)).length > 0)
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
      account.account_role
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
      num_of_needed_signatures: multisig_pubkeys.length,
      value: value,
      pending: 1,
    };

    const savedTransactionId = await saveTransaction(transaction);
    await saveTransactionApproval(savedTransactionId, account.account_id);

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
  // const { password } = req.body;
  const { transaction_id, sender_address } = req.body;
  const access_token = req.cookies.access_token;
  const account = jwt.decode(access_token) as JwtPayload;

  let signer_wallet;

  if (account.role === "admin") signer_wallet = await derivePrivateKey("");
  else {
    const wallet_info = await retrieveWalletByAddress(sender_address);
    signer_wallet = await derivePrivateKey(wallet_info.derivation_path ?? "");
    if (!wallet_info)
      return res
        .status(404)
        .json({ status: 404, message: "Wallet not found!" });
  }

  const psbt = await retrieveTransactionByTransactionId(transaction_id);
  const signed_psbt = await signTransaction(
    psbt[0].psbt ?? "",
    signer_wallet,
    0
  );

  await updatePSBT(transaction_id, signed_psbt);
  await saveTransactionApproval(transaction_id, account.account_id);
  if (await validateAllSignaturesCompleted(signed_psbt)) {
    await broadcastTransaction(signed_psbt);
    await updateTransactionStatus(transaction_id);
  }

  return res.status(200).json({
    status: 200,
    message: "Transaction signed successfully!",
  });
});

export default app;
