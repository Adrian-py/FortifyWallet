import { MysqlError } from "mysql";

import { db_connection } from "@db/init";
import { AuthorizationToken, RefreshToken } from "@interfaces/authInterface";

async function saveAuthorizationCode(account_id: string, token: string) {
  const SAVE_TOKEN_QUERY = `INSERT INTO authorization_codes (account_id, authorization_code) VALUES (${account_id}, '${token}')`;
  return new Promise((resolve, reject) => {
    db_connection.query(SAVE_TOKEN_QUERY, (err: MysqlError, res: any) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}

async function retrieveAuthorizationCode(
  token: string
): Promise<AuthorizationToken[]> {
  const RETRIEVE_TOKEN_QUERY = `SELECT * FROM authorization_codes WHERE authorization_code = '${token}'`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      RETRIEVE_TOKEN_QUERY,
      (err: MysqlError, res: AuthorizationToken[]) => {
        if (err) reject(err);

        resolve(res);
      }
    );
  });
}

async function deleteAuthorizationCode(account_id: string) {
  const DELETE_TOKEN_QUERY = `DELETE FROM authorization_codes WHERE account_id = ${account_id}`;
  return new Promise((resolve, reject) => {
    db_connection.query(DELETE_TOKEN_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

async function saveRefreshToken(account_id: string, refresh_token: string) {
  const SAVE_REFRESH_TOKEN_QUERY = `INSERT INTO tokens (account_id, token) VALUES (${account_id}, '${refresh_token}')`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      SAVE_REFRESH_TOKEN_QUERY,
      (err: MysqlError, res: any) => {
        if (err) reject(err);

        resolve(res);
      }
    );
  });
}

async function retrieveRefreshToken(
  account_id: string
): Promise<RefreshToken[]> {
  const RETRIEVE_REFRESH_TOKEN_QUERY = `SELECT * FROM tokens WHERE account_id = ${account_id}`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      RETRIEVE_REFRESH_TOKEN_QUERY,
      (err: MysqlError, res: RefreshToken[]) => {
        if (err) reject(err);

        resolve(res);
      }
    );
  });
}

async function removeRefreshToken(account_id: string) {
  const DELETE_REFRESH_TOKEN_QUERY = `DELETE FROM tokens WHERE account_id = ${account_id}`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      DELETE_REFRESH_TOKEN_QUERY,
      (err: MysqlError, res: any) => {
        if (err) reject(err);
        resolve(res);
      }
    );
  });
}

export {
  saveAuthorizationCode,
  retrieveAuthorizationCode,
  deleteAuthorizationCode,
  saveRefreshToken,
  retrieveRefreshToken,
  removeRefreshToken,
};
