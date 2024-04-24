import { MysqlError } from "mysql";

import { companyInfo } from "@interfaces/companyInterface";
import { db_connection } from "@db/init";

async function saveCompanyInfo(companyInfo: companyInfo) {
  const INSERT_QUERY = "INSERT INTO company SET ?";
  return new Promise((resolve, reject) => {
    db_connection.query(
      INSERT_QUERY,
      companyInfo,
      (err: MysqlError | null, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
}

async function verifyCompanyInfo() {
  const SELECT_QUERY = "SELECT * FROM company WHERE company_id=1";
  return new Promise((resolve, reject) => {
    db_connection.query(SELECT_QUERY, (err: MysqlError | null, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.length > 0);
      }
    });
  });
}

export { saveCompanyInfo, verifyCompanyInfo };
