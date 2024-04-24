import mysql from "mysql";

import userInterface from "@interfaces/userInterface";

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fortify_wallet",
});

async function connectToDatabase() {
  connection.connect(async (err: Error) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("DB Connection Successful!");
    console.log("Initializing Database...");
    await initializeDatabase();
  });
}

async function initializeDatabase() {
  const INIT_TABLE_QUERY = [
    "CREATE TABLE IF NOT EXISTS company (company_id int AUTO_INCREMENT, company_name varchar(20), company_email varchar(20), company_desc TEXT, PRIMARY KEY(company_id))",
    "CREATE TABLE IF NOT EXISTS roles (role_id int AUTO_INCREMENT, role_name varchar(20), role_desc TEXT, PRIMARY KEY(role_id))",
    "CREATE TABLE IF NOT EXISTS users (user_id int AUTO_INCREMENT, username varchar(20) UNIQUE, email varchar(20), password varchar(100), role_id int, PRIMARY KEY(user_id), FOREIGN KEY(role_id) REFERENCES roles(role_id))",
    "CREATE TABLE IF NOT EXISTS wallets (wallet_id int AUTO_INCREMENT, user_id int, pubkey varchar(100), priv_key varchar(100), PRIMARY KEY(wallet_id), FOREIGN KEY(user_id) REFERENCES users(user_id))",
    "CREATE TABLE IF NOT EXISTS tokens (token_id int AUTO_INCREMENT, user_id int UNIQUE, token varchar(200) UNIQUE, PRIMARY KEY(token_id), FOREIGN KEY(user_id) REFERENCES users(user_id))",
    "CREATE TABLE IF NOT EXISTS authorization_codes (auth_id int AUTO_INCREMENT, user_id int UNIQUE, authorization_code varchar(100) UNIQUE, PRIMARY KEY(auth_id), FOREIGN KEY(user_id) REFERENCES users(user_id))",
  ];
  INIT_TABLE_QUERY.forEach((query, ind) => {
    connection.query(query, (err: Error) => {
      if (err) {
        console.error(
          "Error CREATE " + (ind + 1) + "-th Table: " + err.message
        );
        return;
      }
      console.log("Successfully Created " + (ind + 1) + "-th Table");
    });
  });
}

async function seedDatabase() {
  const SEED_TABLE_QUERY = [
    "INSERT INTO roles (role_name, role_desc) VALUES ('admin', 'Admin Role'), ('head', 'Head Department'), ('member', 'Member of Department')",
    "INSERT INTO users (username, email, password, role_id) VALUES ('admin', 'admin@gmail.com', '$2b$10$kwu.QFRUe9wSv/oAGRXfceORYIr5UmBQLtcXTMzWPqvqQSFlgSx2C', 1)",
  ];
  SEED_TABLE_QUERY.forEach((query, ind) => {
    connection.query(query, (err: Error) => {
      if (err) {
        console.error(
          "Error INSERT " + (ind + 1) + "-th Table: " + err.message
        );
        return;
      }
    });
  });
  console.log("Successfully Seeded Database!");
}

async function retrieveUser(username: string): Promise<userInterface[]> {
  const RETRIEVE_USER_QUERY = `SELECT * FROM users WHERE username = '${username}'`;
  return new Promise((resolve, reject) => {
    connection.query(
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
  connection as db_connection,
  connectToDatabase,
  seedDatabase,
  retrieveUser,
};
