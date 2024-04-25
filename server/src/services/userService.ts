import { db_connection } from '@db/init';

async function getRole(user_id: string): Promise<string> {
  const PRIVILIGE_QUERY = `SELECT role_name FROM roles WHERE role_id = (SELECT role_id FROM users WHERE user_id = ${user_id})`;
  return new Promise((resolve, reject) => {
    db_connection.query(PRIVILIGE_QUERY, (err: Error, res: any) => {
      if (err) reject(err);
      resolve(res[0].role_name);
    });
  });
}

async function hasPrivilegeToCreate(user_id: string): Promise<boolean> {
  const PRIVILEGE_QUERY = `SELECT role_name FROM roles WHERE role_id = (SELECT role_id FROM users WHERE user_id = ${user_id})`;
  return new Promise((resolve, reject) => {
    db_connection.query(PRIVILEGE_QUERY, (err: Error, res: any) => {
      if (err) reject(err);
      resolve(res[0].role_name == 'admin');
    });
  });
}

async function hasPrivilegeToDerive(user_id: string): Promise<boolean> {
  const PRIVILEGE_QUERY = `SELECT role_name FROM roles WHERE role_id = (SELECT role_id FROM users WHERE user_id = ${user_id})`;
  return new Promise((resolve, reject) => {
    db_connection.query(PRIVILEGE_QUERY, (err: Error, res: any) => {
      if (err) reject(err);
      resolve(res[0].role_name == 'admin' || res[0].role_name == 'head');
    });
  });
}

export { getRole, hasPrivilegeToCreate, hasPrivilegeToDerive };
