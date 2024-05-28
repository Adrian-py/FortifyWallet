import { retrieveAccountById } from "@services/accountService";
import bcrypt from "bcrypt";

function validateUserCredentials(
  username: string,
  email: string,
  password: string
) {
  // Validate username
  if (username.length < 5 || username.length > 10)
    throw new Error("Username needs to be between 5 and 10 characters long!");
  if (password.length < 8 || password.length > 20)
    throw new Error("Password needs to be between 8 and 20 characters long!");

  //  Validate email address
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error("Invalid email address!");

  //  Validate password
  const uppercaseRegex = /[A-Z]/;
  const numberRegex = /[0-9]/;
  if (!numberRegex.test(password))
    throw new Error("Password must contain at least one number!");
  if (!uppercaseRegex.test(password))
    throw new Error("Password must contain at least one uppercase letter!");
}

async function checkPassword(
  account_id: string,
  password: string
): Promise<boolean> {
  const account = await retrieveAccountById(account_id);
  if (account.length === 0) return false;

  const match_password = await bcrypt.compare(
    password,
    account[0].password ?? ""
  );

  return match_password;
}

export { validateUserCredentials, checkPassword };
