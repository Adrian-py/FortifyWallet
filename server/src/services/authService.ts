import { MysqlError } from 'mysql';

import { db_connection } from '@db/init';
import userInterface from '@interfaces/userInterface';

interface authorizationToken {
  token_id: number;
  user_id: string;
  token: string;
}

interface refreshToken {
  token_id: number;
  user_id: string;
  token: string;
}

async function saveAuthorizationCode(user_id: string, token: string) {
  const SAVE_TOKEN_QUERY = `INSERT INTO authorization_codes (user_id, authorization_code) VALUES (${user_id}, '${token}')`;
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
): Promise<authorizationToken[]> {
  const RETRIEVE_TOKEN_QUERY = `SELECT * FROM authorization_codes WHERE authorization_code = '${token}'`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      RETRIEVE_TOKEN_QUERY,
      (err: MysqlError, res: authorizationToken[]) => {
        if (err) reject(err);

        resolve(res);
      }
    );
  });
}

async function deleteAuthorizationCode(user_id: string) {
  const DELETE_TOKEN_QUERY = `DELETE FROM authorization_codes WHERE user_id = ${user_id}`;
  return new Promise((resolve, reject) => {
    db_connection.query(DELETE_TOKEN_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

async function saveRefreshToken(user_id: string, refresh_token: string) {
  const SAVE_REFRESH_TOKEN_QUERY = `INSERT INTO tokens (user_id, token) VALUES (${user_id}, '${refresh_token}')`;
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

async function retrieveRefreshToken(user_id: string): Promise<refreshToken[]> {
  const RETRIEVE_REFRESH_TOKEN_QUERY = `SELECT * FROM tokens WHERE user_id = ${user_id}`;
  return new Promise((resolve, reject) => {
    db_connection.query(
      RETRIEVE_REFRESH_TOKEN_QUERY,
      (err: MysqlError, res: refreshToken[]) => {
        if (err) reject(err);

        resolve(res);
      }
    );
  });
}

async function removeRefreshToken(user_id: string) {
  const DELETE_REFRESH_TOKEN_QUERY = `DELETE FROM tokens WHERE user_id = ${user_id}`;
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

async function retrieveUser(username: string): Promise<userInterface[]> {
  const RETRIEVE_USER_QUERY = `SELECT * FROM users WHERE username = '${username}'`;
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

export {
  saveAuthorizationCode,
  retrieveAuthorizationCode,
  deleteAuthorizationCode,
  saveRefreshToken,
  retrieveRefreshToken,
  removeRefreshToken,
  retrieveUser,
};
