import mysql from "mysql";

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
    "CREATE TABLE IF NOT EXISTS accounts (account_id int AUTO_INCREMENT, username varchar(20) UNIQUE, email varchar(20) UNIQUE, password varchar(100), role_id int, reports_to int, PRIMARY KEY(account_id), FOREIGN KEY(role_id) REFERENCES roles(role_id), FOREIGN KEY(reports_to) REFERENCES accounts(account_id))",
    "CREATE TABLE IF NOT EXISTS wallets (wallet_id int AUTO_INCREMENT, account_id int, pubkey varchar(100), address varchar(100), PRIMARY KEY(wallet_id), FOREIGN KEY(account_id) REFERENCES accounts(account_id))",
    "CREATE TABLE IF NOT EXISTS tokens (token_id int AUTO_INCREMENT, account_id int UNIQUE, token varchar(200) UNIQUE, PRIMARY KEY(token_id), FOREIGN KEY(account_id) REFERENCES accounts(account_id))",
    "CREATE TABLE IF NOT EXISTS authorization_codes (auth_id int AUTO_INCREMENT, account_id int UNIQUE, authorization_code varchar(100) UNIQUE, PRIMARY KEY(auth_id), FOREIGN KEY(account_id) REFERENCES accounts(account_id))",
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
    "INSERT INTO accounts (username, email, password, role_id) VALUES ('admin', 'admin@gmail.com', '$2b$10$kwu.QFRUe9wSv/oAGRXfceORYIr5UmBQLtcXTMzWPqvqQSFlgSx2C', 1)",
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

export { connection as db_connection, connectToDatabase, seedDatabase };
