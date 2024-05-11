import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";

import roleMiddleware from "@middleware/roleMiddleware";
import tokenMiddleware from "@middleware/tokenMiddleware";
import {
  createAccount,
  retrieveAllAccounts,
  retrieveDepartmentMembers,
  getAccountDepartment,
} from "@services/accountService";
import { retrieveRoleId } from "@services/roleService";
import { checkIfDepartmentAlreadyHasHead } from "@services/departmentService";
import { deriveWallet } from "@services/walletService";
import { validateUserCredentials } from "@utils/authUtils";

const app = express.Router();

app.use(tokenMiddleware);
app.use(roleMiddleware);

app.get("/retrieve", async (req, res) => {
  try {
    const access_token = req.cookies.access_token;
    const account = jwt.decode(access_token) as JwtPayload;

    if (account.role === "admin") {
      const accounts = await retrieveAllAccounts();
      return res.status(200).json({ status: 200, accounts });
    }
    const { department_id } = await getAccountDepartment(account.account_id);
    const accounts = await retrieveDepartmentMembers(department_id);
    return res.status(200).json({ status: 200, accounts });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Something went wrong in the server!",
      error: err.message,
    });
  }
});

app.post("/create", async (req, res) => {
  const access_token = req.cookies.access_token;
  const creator_account = jwt.decode(access_token) as JwtPayload;

  try {
    const new_account = {
      username: req.body.new_account.username,
      email: req.body.new_account.email,
      password: await bcrypt.hash(req.body.new_account.password, 10),
      role_id: await retrieveRoleId(req.body.new_account.role),
      department_id: req.body.new_account.department_id,
    };

    // Validate User Credentials
    validateUserCredentials(
      req.body.new_account.username,
      req.body.new_account.email,
      req.body.new_account.password
    );

    // If creator is a department head, assign the new account to the same department
    if (creator_account.role === "head")
      new_account.department_id = (
        await getAccountDepartment(creator_account.account_id)
      ).department_id;

    if (!new_account.department_id)
      return res
        .status(400)
        .json({ status: 400, message: "Missing department id!" });

    // Check if department already has a head if the new account's role is head
    if (
      req.body.new_account.role === "head" &&
      (await checkIfDepartmentAlreadyHasHead(
        req.body.new_account.department_id
      ))
    )
      return res
        .status(400)
        .json({ status: 400, message: "Department already has a head!" });

    return await createAccount(new_account)
      .then(async (res: any) => {
        if (req.body.new_account.role === "head")
          await deriveWallet(res.insertId, req.body.new_account.role);
      })
      .then((_) => {
        console.log(
          "A new account was created by account id: ",
          creator_account.account_id
        );
        return res
          .status(200)
          .json({ status: 200, message: "Account created!" });
      });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Error: Something went wrong when creating account!",
      error: err.message,
    });
  }
});

export default app;
