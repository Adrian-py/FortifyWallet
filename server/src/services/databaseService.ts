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
    "CREATE TABLE IF NOT EXISTS users (user_id int AUTO_INCREMENT, username varchar(20), email varchar(20), password varchar(20), role_id int, PRIMARY KEY(user_id), FOREIGN KEY(role_id) REFERENCES roles(role_id))",
    "CREATE TABLE IF NOT EXISTS wallets (wallet_id int AUTO_INCREMENT, user_id int, pubkey varchar(100), priv_key varchar(100), PRIMARY KEY(wallet_id), FOREIGN KEY(user_id) REFERENCES users(user_id))",
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

export { connection as db_connection, connectToDatabase };
