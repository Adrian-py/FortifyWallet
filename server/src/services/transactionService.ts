import { MysqlError } from "mysql";

import { db_connection } from "@db/init";
import {
  TransactionInterface,
  RetrieveTranscationInterface,
} from "@interfaces/transactionInterface";

async function saveTransaction(
  transaction: TransactionInterface
): Promise<any> {
  const TRANSACTION_QUERY = `
        INSERT INTO transactions (initiator_id, sender, recipient, psbt, value, num_signatures, num_of_needed_signatures, pending) VALUES (${transaction.initiator_id}, '${transaction.sender}', '${transaction.recipient}','${transaction.psbt}', '${transaction.value}', ${transaction.num_signatures}, ${transaction.num_of_needed_signatures}, ${transaction.pending})
    `;

  return new Promise((resolve, reject) => {
    db_connection.query(TRANSACTION_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res.insertId);
    });
  });
}

async function updateTransactionStatus(transaction_id: string): Promise<any> {
  const TRANSACTION_QUERY = `
        UPDATE transactions SET pending = 0 WHERE transaction_id = ${transaction_id}
    `;

  return new Promise((resolve, reject) => {
    db_connection.query(TRANSACTION_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

async function updateTransactionBroadcastStatus(
  transaction_id: string
): Promise<any> {
  const TRANSACTION_QUERY = `
        UPDATE transactions SET broadcasted = 1 WHERE transaction_id = ${transaction_id}
    `;

  return new Promise((resolve, reject) => {
    db_connection.query(TRANSACTION_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

async function updatePSBT(transaction_id: string, new_psbt: string) {
  const TRANSACTION_QUERY = `
    UPDATE transactions SET psbt = '${new_psbt}', num_signatures = num_signatures + 1 WHERE transaction_id = ${transaction_id}
  `;

  return new Promise((resolve, reject) => {
    db_connection.query(TRANSACTION_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

async function retrieveAllTransactions(
  account_id: string
): Promise<RetrieveTranscationInterface[]> {
  let TRANSACTION_QUERY = `
      SELECT accounts.username AS initiator_username, transactions.transaction_id, transactions.initiator_id, transactions.recipient, transactions.sender, transactions.psbt, transactions.value, transactions.num_signatures, transactions.num_of_needed_signatures, transactions.pending, IF(transaction_approvals.transaction_id IS NOT NULL, 1, 0) AS approved, transactions.broadcasted FROM transactions
      INNER JOIN accounts ON transactions.initiator_id = accounts.account_id
      LEFT JOIN transaction_approvals ON transactions.transaction_id = transaction_approvals.transaction_id AND transaction_approvals.account_id = ${account_id}
    `;

  return new Promise((resolve, reject) => {
    db_connection.query(
      TRANSACTION_QUERY,
      (err: MysqlError, res: RetrieveTranscationInterface[]) => {
        if (err) reject(err);
        resolve(res);
      }
    );
  });
}

async function retrieveTransactionByTransactionId(
  transaction_id: string
): Promise<TransactionInterface[]> {
  const TRANSACTION_QUERY = `
    SELECT accounts.username AS initiator_username, transactions.transaction_id, transactions.initiator_id, transactions.recipient, transactions.sender, transactions.psbt, transactions.value, transactions.num_signatures, transactions.num_of_needed_signatures, transactions.pending, transactions.broadcasted FROM transactions
    INNER JOIN accounts ON transactions.initiator_id = accounts.account_id
    WHERE transactions.transaction_id = ${transaction_id}
  `;
  return new Promise((resolve, reject) => {
    db_connection.query(
      TRANSACTION_QUERY,
      (err: MysqlError, res: TransactionInterface[]) => {
        if (err) reject(err);
        resolve(res);
      }
    );
  });
}

async function retrieveTransactionsByInitiatorId(
  initiator_id: string
): Promise<TransactionInterface[]> {
  const TRANSACTION_QUERY = `
        SELECT accounts.username as initiator_username, transactions.transaction_id, transactions.initiator_id, transactions.recipient, transactions.sender, transactions.psbt, transactions.value, transactions.num_signatures, transactions.num_of_needed_signatures, transactions.pending FROM transactions
        INNER JOIN accounts ON accounts.account_id = transactions.initiator_id
        WHERE initiator_id = ${initiator_id} 
    `;
  return new Promise((resolve, reject) => {
    db_connection.query(
      TRANSACTION_QUERY,
      (err: MysqlError, res: TransactionInterface[]) => {
        if (err) reject(err);
        resolve(res);
      }
    );
  });
}

async function retrieveTransactionsByWalletAddress(
  address: string
): Promise<TransactionInterface[]> {
  const TRANSACTION_QUERY = `
    SELECT accounts.username AS initiator_username, transactions.transaction_id, transactions.initiator_id, transactions.recipient, transactions.sender, transactions.psbt, transactions.value, transactions.num_signatures, transactions.num_of_needed_signatures, transactions.pending  FROM transactions 
    INNER JOIN wallets ON transactions.initiator_id = wallets.account_id
    INNER JOIN accounts ON wallets.account_id = accounts.account_id
    WHERE wallets.address = '${address}'
  `;
  return new Promise((resolve, reject) => {
    db_connection.query(
      TRANSACTION_QUERY,
      (err: MysqlError, res: TransactionInterface[]) => {
        if (err) reject(err);
        resolve(res);
      }
    );
  });
}

async function retrieveActiveTransactionsByWalletAddress(
  address: string
): Promise<TransactionInterface[]> {
  const TRANSACTION_QUERY = `
    SELECT accounts.username AS initiator_username, transactions.transaction_id, transactions.initiator_id, transactions.recipient, transactions.sender, transactions.psbt, transactions.value, transactions.num_signatures, transactions.num_of_needed_signatures, transactions.pending  FROM transactions 
    INNER JOIN wallets ON transactions.initiator_id = wallets.account_id
    INNER JOIN accounts ON wallets.account_id = accounts.account_id
    WHERE wallets.address = '${address} AND wallets.pending = 1'
  `;
  return new Promise((resolve, reject) => {
    db_connection.query(
      TRANSACTION_QUERY,
      (err: MysqlError, res: TransactionInterface[]) => {
        if (err) reject(err);
        resolve(res);
      }
    );
  });
}

async function retrieveTransactionsByDepartment(
  department_id: string
): Promise<TransactionInterface[]> {
  const TRANSACTION_QUERY = `
    SELECT accounts.username AS initiator_username, transactions.transaction_id, transactions.initiator_id, transactions.recipient, transactions.sender, transactions.psbt, transactions.value, transactions.num_signatures, transactions.num_of_needed_signatures, transactions.pending
     FROM transactions 
    INNER JOIN accounts ON transactions.initiator_id = accounts.account_id
    WHERE accounts.department_id = '${department_id}'
  `;
  return new Promise((resolve, reject) => {
    db_connection.query(
      TRANSACTION_QUERY,
      (err: MysqlError, res: TransactionInterface[]) => {
        if (err) reject(err);
        resolve(res);
      }
    );
  });
}

export {
  saveTransaction,
  updatePSBT,
  retrieveAllTransactions,
  updateTransactionStatus,
  updateTransactionBroadcastStatus,
  retrieveTransactionByTransactionId,
  retrieveTransactionsByInitiatorId,
  retrieveTransactionsByWalletAddress,
  retrieveActiveTransactionsByWalletAddress,
  retrieveTransactionsByDepartment,
};
