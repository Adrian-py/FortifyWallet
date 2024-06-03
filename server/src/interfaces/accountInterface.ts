interface userInterface {
  account_id?: string;
  username: string;
  email: string;
  password?: string;
  role_id: number;
  department_id?: number;
  role_name?: string;
  department_name?: string;
  enabled_two_factor?: number;
}

export default userInterface;
