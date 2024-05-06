import { db_connection } from "@db/init";
import { MysqlError } from "mysql";

async function saveTransactionApproval(
  transaction_id: string,
  account_id: string
) {
  const APPROVAL_QUERY = `
    INSERT INTO transaction_approvals (transaction_id, account_id) VALUES (${transaction_id}, ${account_id})
    `;
  return new Promise((resolve, reject) => {
    db_connection.query(APPROVAL_QUERY, (err: MysqlError) => {
      if (err) reject(err);
      resolve("Transaction approval saved successfully!");
    });
  });
}

export { saveTransactionApproval };
