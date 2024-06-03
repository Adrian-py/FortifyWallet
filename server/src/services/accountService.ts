import { MysqlError } from "mysql";

import { db_connection } from "@db/init";
import userInterface from "@interfaces/accountInterface";
import departmentInterface from "@interfaces/departmentInterface";
import { retrieveWalletByAddress } from "./walletService";

async function createAccount(new_account: userInterface) {
  const CREATE_ACCOUNT_QUERY = `INSERT INTO accounts (username, email, password, role_id, department_id) VALUES ('${new_account.username}', '${new_account.email}', '${new_account.password}', ${new_account.role_id}, ${new_account.department_id})`;
  return new Promise((resolve, reject) => {
    db_connection.query(CREATE_ACCOUNT_QUERY, (err: MysqlError, res: any) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}

async function saveTwoFactorSecret(account_id: string, secret: string) {
  const SAVE_TWO_FACTOR_SECRET_QUERY = `UPDATE accounts SET two_factor_secret = '${secret}' WHERE account_id = ${account_id}`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      SAVE_TWO_FACTOR_SECRET_QUERY,
      (err: MysqlError, res: any) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      }
    );
  });
}

async function updateTwoFactorStatus(account_id: string) {
  const UPDATE_TWO_FACTOR_STATUS_QUERY = `UPDATE accounts SET enabled_two_factor = 1 WHERE account_id = ${account_id}`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      UPDATE_TWO_FACTOR_STATUS_QUERY,
      (err: MysqlError, res: any) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      }
    );
  });
}

async function retrieveTwoFactorSecret(account_id: string): Promise<string> {
  const RETRIEVE_TWO_FACTOR_SECRET_QUERY = `SELECT two_factor_secret FROM accounts WHERE account_id = ${account_id}`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      RETRIEVE_TWO_FACTOR_SECRET_QUERY,
      (err: MysqlError, res: any) => {
        if (err) {
          reject(err);
        }
        resolve(res[0].two_factor_secret);
      }
    );
  });
}

async function retrieveAllAccounts(): Promise<userInterface[]> {
  const RETRIEVE_ALL_ACCOUNTS_QUERY = `SELECT account_id, username, email, roles.role_name, departments.department_name FROM accounts INNER JOIN roles ON accounts.role_id = roles.role_id INNER JOIN departments ON accounts.department_id = departments.department_id`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      RETRIEVE_ALL_ACCOUNTS_QUERY,
      (err: MysqlError, res: userInterface[]) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      }
    );
  });
}

async function retrieveAccount(username: string): Promise<userInterface[]> {
  const RETRIEVE_USER_QUERY = `SELECT account_id, username, password FROM accounts WHERE username = '${username}'`;
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

async function retrieveAccountInfo(
  account_id: string
): Promise<userInterface[]> {
  const RETRIEVE_USER_QUERY = `SELECT account_id, username, email, roles.role_name, departments.department_name, enabled_two_factor FROM accounts INNER JOIN roles ON accounts.role_id = roles.role_id LEFT JOIN departments ON accounts.department_id = departments.department_id WHERE account_id = ${account_id}`;
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

async function retrieveAccountById(
  account_id: string
): Promise<userInterface[]> {
  const RETRIEVE_USER_QUERY = `SELECT account_id, username, password FROM accounts WHERE account_id = ${account_id}`;
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

async function getAccountDepartment(
  account_id: string
): Promise<departmentInterface> {
  const DEPARTMENT_QUERY = `SELECT department_name, department_id FROM departments WHERE department_id = (SELECT department_id FROM accounts WHERE account_id = ${account_id})`;
  return new Promise((resolve, reject) => {
    db_connection.query(DEPARTMENT_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res[0]);
    });
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

async function retrieveDepartmentMembers(
  department_id: string
): Promise<userInterface[]> {
  const RETRIEVE_DEPARTMENT_MEMBERS_QUERY = `SELECT account_id, username, email, roles.role_name, departments.department_name FROM accounts INNER JOIN roles ON roles.role_id = accounts.role_id INNER JOIN departments ON accounts.department_id = departments.department_id WHERE accounts.department_id = ${department_id}`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      RETRIEVE_DEPARTMENT_MEMBERS_QUERY,
      (err: MysqlError, res: userInterface[]) => {
        if (err) {
          reject(err);
        }
        resolve(res);
      }
    );
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

async function hasPrivilegeToViewWallet(
  account_id: string,
  account_role: string,
  wallet_address: string
): Promise<boolean> {
  if (account_role === "admin") {
    return true;
  } else {
    try {
      const wallet = await retrieveWalletByAddress(wallet_address);

      if (account_role === "head") {
        const account_department = await getAccountDepartment(account_id);
        return account_department.department_id === wallet.department_id;
      }

      return account_id === wallet.account_id;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

async function hasPrivilegeToTransfer(
  account_id: string,
  wallet_address: string
): Promise<boolean> {
  const wallet = await retrieveWalletByAddress(wallet_address);
  return account_id === wallet.account_id;
}

export {
  createAccount,
  saveTwoFactorSecret,
  updateTwoFactorStatus,
  retrieveTwoFactorSecret,
  retrieveAccount,
  retrieveAccountInfo,
  retrieveAccountById,
  retrieveAllAccounts,
  getAccountDepartment,
  getAccountRole,
  retrieveDepartmentMembers,
  hasPrivilegeToDerive,
  hasPrivilegeToViewWallet,
  hasPrivilegeToTransfer,
};
