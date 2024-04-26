import { MysqlError } from "mysql";

import { db_connection } from "@db/init";

async function retrieveRoleId(role_name: string): Promise<number> {
  const RETRIEVE_ROLE_QUERY = `SELECT role_id FROM roles WHERE role_name = '${role_name}'`;
  return new Promise((resolve, reject) => {
    db_connection.query(RETRIEVE_ROLE_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res[0].role_id);
    });
  });
}

export { retrieveRoleId };
