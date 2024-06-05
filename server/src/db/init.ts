import mysql from "mysql";

const connection = mysql.createConnection({
  host: process.env.SQL_HOST || "localhost",
  user: process.env.SQL_USERNAME || "root",
  password: process.env.SQL_PASSWORD || "",
  database: process.env.SQL_DATABASE || "fortify_wallet",
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
    "CREATE TABLE IF NOT EXISTS company (company_id int AUTO_INCREMENT, company_name varchar(20), company_email varchar(20), company_desc TEXT, public_key varchar(300),private_key varchar(300), PRIMARY KEY(company_id))",
    "CREATE TABLE IF NOT EXISTS roles (role_id int AUTO_INCREMENT, role_name varchar(20), role_desc TEXT, PRIMARY KEY(role_id))",
    "CREATE TABLE IF NOT EXISTS departments (department_id int AUTO_INCREMENT, department_name varchar(20), department_desc TEXT, PRIMARY KEY(department_id))",
    "CREATE TABLE IF NOT EXISTS accounts (account_id int AUTO_INCREMENT, username varchar(20) UNIQUE, email varchar(20) UNIQUE, password varchar(100), role_id int, department_id int, enabled_two_factor int, two_factor_secret varchar(200), PRIMARY KEY(account_id), FOREIGN KEY(role_id) REFERENCES roles(role_id), FOREIGN KEY(department_id) REFERENCES departments(department_id))",
    "CREATE TABLE IF NOT EXISTS wallets (wallet_id int AUTO_INCREMENT, account_id int, department_id int, pub_key varchar(100), address varchar(100), derivation_path varchar(20), PRIMARY KEY(wallet_id), FOREIGN KEY(account_id) REFERENCES accounts(account_id), FOREIGN KEY(department_id) REFERENCES departments(department_id))",
    "CREATE TABLE IF NOT EXISTS tokens (token_id int AUTO_INCREMENT, account_id int UNIQUE, token varchar(200) UNIQUE, PRIMARY KEY(token_id), FOREIGN KEY(account_id) REFERENCES accounts(account_id))",
    "CREATE TABLE IF NOT EXISTS authorization_codes (auth_id int AUTO_INCREMENT, account_id int UNIQUE, authorization_code varchar(100) UNIQUE, PRIMARY KEY(auth_id), FOREIGN KEY(account_id) REFERENCES accounts(account_id))",
    "CREATE TABLE IF NOT EXISTS transactions (transaction_id int AUTO_INCREMENT, initiator_id int, sender varchar(100), recipient varchar(100), psbt varchar(1000), value int, num_signatures int DEFAULT 0, num_of_needed_signatures int DEFAULT 2, pending int DEFAULT 0, broadcasted int DEFAULT 0, PRIMARY KEY(transaction_id), FOREIGN KEY(initiator_id) REFERENCES accounts(account_id))",
    "CREATE TABLE IF NOT EXISTS transaction_approvals (approval_id int AUTO_INCREMENT, transaction_id int, account_id int, PRIMARY KEY(approval_id), FOREIGN KEY(transaction_id) REFERENCES transactions(transaction_id), FOREIGN KEY(account_id) REFERENCES accounts(account_id))",
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
