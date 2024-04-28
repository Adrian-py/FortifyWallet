import { MysqlError } from "mysql";

import { db_connection } from "@db/init";
import userInterface from "@interfaces/userInterface";

async function createAccount(new_account: userInterface) {
  const CREATE_ACCOUNT_QUERY = `INSERT INTO accounts (username, email, password, role_id, reports_to) VALUES ('${new_account.username}', '${new_account.email}', '${new_account.password}', ${new_account.role_id}, ${new_account.reports_to})`;
  return new Promise((resolve, reject) => {
    db_connection.query(CREATE_ACCOUNT_QUERY, (err: MysqlError, res: any) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}

async function retrieveAccount(username: string): Promise<userInterface[]> {
  const RETRIEVE_USER_QUERY = `SELECT * FROM accounts WHERE username = '${username}'`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      RETRIEVE_USER_QUERY,
      (err: MysqlError, result: userInterface[]) => {
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
    db_connection.query(PRIVILIGE_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res[0].role_name);
    });
  });
}

async function retrieveAccountsBelow(
  account_id: string
): Promise<userInterface[]> {
  let RETRIEVE_USERS_BELOW_QUERY = `SELECT accounts.account_id, accounts.username, accounts.email, roles.role_name 
                                   FROM accounts 
                                   INNER JOIN roles ON accounts.role_id = roles.role_id 
                                   WHERE accounts.reports_to = ${account_id}`;

  const user_role = await getAccountRole(account_id);
  if (user_role == "admin") {
    RETRIEVE_USERS_BELOW_QUERY = `SELECT accounts.account_id, accounts.username, accounts.email, roles.role_name FROM accounts INNER JOIN roles ON accounts.role_id = roles.role_id`; // Retrieve all accounts if account is an admin, and only accounts below if account is a head
  }

  return new Promise((resolve, reject) => {
    db_connection.query(
      RETRIEVE_USERS_BELOW_QUERY,
      (err: MysqlError, result: userInterface[]) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    );
  });
}

async function retrieveHeadDepartmentAccounts(): Promise<userInterface[]> {
  const RETRIEVE_HEAD_DEPARTMENT_ACCOUNTS_QUERY = `SELECT account_id, username FROM accounts WHERE role_id = 2`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      RETRIEVE_HEAD_DEPARTMENT_ACCOUNTS_QUERY,
      (err: MysqlError, res: userInterface[]) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      }
    );
  });
}

async function hasPrivilegeToCreate(account_id: string): Promise<boolean> {
  const PRIVILEGE_QUERY = `SELECT role_name FROM roles WHERE role_id = (SELECT role_id FROM accounts WHERE account_id = ${account_id})`;
  return new Promise((resolve, reject) => {
    db_connection.query(PRIVILEGE_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res[0].role_name == "admin");
    });
  });
}

async function hasPrivilegeToDerive(account_id: string): Promise<boolean> {
  const PRIVILEGE_QUERY = `SELECT role_name FROM roles WHERE role_id = (SELECT role_id FROM accounts WHERE account_id = ${account_id})`;
  return new Promise((resolve, reject) => {
    db_connection.query(PRIVILEGE_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res[0].role_name == "admin" || res[0].role_name == "head");
    });
  });
}

export {
  createAccount,
  retrieveAccount,
  getAccountRole,
  retrieveHeadDepartmentAccounts,
  retrieveAccountsBelow,
  hasPrivilegeToCreate,
  hasPrivilegeToDerive,
};
