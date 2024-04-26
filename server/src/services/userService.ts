import { db_connection } from "@db/init";
import userInterface from "@interfaces/userInterface";

async function retrieveAccount(username: string): Promise<userInterface[]> {
  const RETRIEVE_USER_QUERY = `SELECT * FROM accounts WHERE username = '${username}'`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      RETRIEVE_USER_QUERY,
      (err: Error, result: userInterface[]) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    );
  });
}

async function getAccountRole(account_id: string): Promise<string> {
  const PRIVILIGE_QUERY = `SELECT role_name FROM roles WHERE role_id = (SELECT role_id FROM accounts WHERE account_id = ${account_id})`;
  return new Promise((resolve, reject) => {
    db_connection.query(PRIVILIGE_QUERY, (err: Error, res: any) => {
      if (err) reject(err);
      resolve(res[0].role_name);
    });
  });
}

async function retrieveAccountsBelow(
  account_id: string
): Promise<userInterface[]> {
  let RETRIEVE_USERS_BELOW_QUERY = `SELECT account_id, username, email FROM accounts WHERE reports_to = ${account_id}`;

  const user_role = await getAccountRole(account_id);
  if (user_role == "admin") {
    RETRIEVE_USERS_BELOW_QUERY = `SELECT account_id, username, email FROM accounts`; // Retrieve all accounts if account is an admin, and only accounts below if account is a head
  }

  return new Promise((resolve, reject) => {
    db_connection.query(
      RETRIEVE_USERS_BELOW_QUERY,
      (err: Error, result: userInterface[]) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    );
  });
}

async function hasPrivilegeToCreate(account_id: string): Promise<boolean> {
  const PRIVILEGE_QUERY = `SELECT role_name FROM roles WHERE role_id = (SELECT role_id FROM accounts WHERE account_id = ${account_id})`;
  return new Promise((resolve, reject) => {
    db_connection.query(PRIVILEGE_QUERY, (err: Error, res: any) => {
      if (err) reject(err);
      resolve(res[0].role_name == "admin");
    });
  });
}

async function hasPrivilegeToDerive(account_id: string): Promise<boolean> {
  const PRIVILEGE_QUERY = `SELECT role_name FROM roles WHERE role_id = (SELECT role_id FROM accounts WHERE account_id = ${account_id})`;
  return new Promise((resolve, reject) => {
    db_connection.query(PRIVILEGE_QUERY, (err: Error, res: any) => {
      if (err) reject(err);
      resolve(res[0].role_name == "admin" || res[0].role_name == "head");
    });
  });
}

export {
  retrieveAccount,
  getAccountRole,
  retrieveAccountsBelow,
  hasPrivilegeToCreate,
  hasPrivilegeToDerive,
};
