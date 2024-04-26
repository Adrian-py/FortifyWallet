import { db_connection } from "@db/init";
import userInterface from "@interfaces/userInterface";

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

async function getUserRole(user_id: string): Promise<string> {
  const PRIVILIGE_QUERY = `SELECT role_name FROM roles WHERE role_id = (SELECT role_id FROM users WHERE user_id = ${user_id})`;
  return new Promise((resolve, reject) => {
    db_connection.query(PRIVILIGE_QUERY, (err: Error, res: any) => {
      if (err) reject(err);
      resolve(res[0].role_name);
    });
  });
}

async function retrieveUsersBelow(user_id: string): Promise<userInterface[]> {
  let RETRIEVE_USERS_BELOW_QUERY = `SELECT user_id, username, email FROM users WHERE reports_to = ${user_id}`;

  const user_role = await getUserRole(user_id);
  if (user_role == "admin") {
    RETRIEVE_USERS_BELOW_QUERY = `SELECT user_id, username, email FROM users`; // Retrieve all users if user is an admin, and only users below if user is a head
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

async function hasPrivilegeToCreate(user_id: string): Promise<boolean> {
  const PRIVILEGE_QUERY = `SELECT role_name FROM roles WHERE role_id = (SELECT role_id FROM users WHERE user_id = ${user_id})`;
  return new Promise((resolve, reject) => {
    db_connection.query(PRIVILEGE_QUERY, (err: Error, res: any) => {
      if (err) reject(err);
      resolve(res[0].role_name == "admin");
    });
  });
}

async function hasPrivilegeToDerive(user_id: string): Promise<boolean> {
  const PRIVILEGE_QUERY = `SELECT role_name FROM roles WHERE role_id = (SELECT role_id FROM users WHERE user_id = ${user_id})`;
  return new Promise((resolve, reject) => {
    db_connection.query(PRIVILEGE_QUERY, (err: Error, res: any) => {
      if (err) reject(err);
      resolve(res[0].role_name == "admin" || res[0].role_name == "head");
    });
  });
}

export {
  retrieveUser,
  getUserRole,
  retrieveUsersBelow,
  hasPrivilegeToCreate,
  hasPrivilegeToDerive,
};
