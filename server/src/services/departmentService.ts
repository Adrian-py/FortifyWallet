import { MysqlError } from "mysql";

import { db_connection } from "@db/init";

async function createDepartment(
  department_name: string,
  department_desc: string
) {
  const DEPARTMENT_QUERY = `INSERT INTO departments (department_name, department_desc) VALUES ('${department_name}', '${department_desc}')`;
  return new Promise((resolve, reject) => {
    db_connection.query(DEPARTMENT_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

async function retrieveAllDepartments() {
  const DEPARTMENT_QUERY = `SELECT * FROM departments`;
  return new Promise((resolve, reject) => {
    db_connection.query(DEPARTMENT_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

async function checkIfDepartmentAlreadyHasHead(department_id: string) {
  const DEPARTMENT_QUERY = `SELECT * FROM accounts WHERE department_id = ${department_id} AND role_id = 2`;
  return new Promise((resolve, reject) => {
    db_connection.query(DEPARTMENT_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res.length > 0);
    });
  });
}

async function retrieveDepartmentName(department_id: string) {
  const DEPARTMENT_QUERY = `SELECT department_name FROM departments WHERE department_id = ${department_id}`;
  return new Promise((resolve, reject) => {
    db_connection.query(DEPARTMENT_QUERY, (err: MysqlError, res: any) => {
      if (err) reject(err);
      resolve(res[0].department_name);
    });
  });
}

export {
  createDepartment,
  checkIfDepartmentAlreadyHasHead,
  retrieveAllDepartments,
  retrieveDepartmentName,
};
