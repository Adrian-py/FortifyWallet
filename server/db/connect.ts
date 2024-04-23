import mysql from "mysql";

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fortify_wallet",
});

async function connectToDatabase() {
  connection.connect((err: Error) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("DB Connection Successful!");
    console.log("Initializing Database...");
    initializeDatabase();
  });
}

async function initializeDatabase() {
  const INIT_TABLE_QUERY = [
    "CREATE TABLE IF NOT EXISTS USER (id int AUTO_INCREMENT, username varchar(20), email varchar(20), password varchar(20), PRIMARY KEY(id))",
    "CREATE TABLE IF NOT EXISTS COMPANY (company_id int AUTO_INCREMENT, company_name varchar(20), company_email varchar(20), PRIMARY KEY(company_id))",
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

export { connectToDatabase };
