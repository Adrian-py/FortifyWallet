import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";

import roleMiddleware from "@middleware/roleMiddleware";
import tokenMiddleware from "@middleware/tokenMiddleware";
import {
  retrieveHeadDepartmentAccounts,
  retrieveAccountsBelow,
  createAccount,
} from "@services/accountService";
import { retrieveRoleId } from "@services/roleService";

const app = express.Router();

app.use(tokenMiddleware);
app.use(roleMiddleware);

app.get("/retrieve", async (req, res) => {
  try {
    const access_token = req.cookies.access_token;
    const account = jwt.decode(access_token) as JwtPayload;

    const accounts = await retrieveAccountsBelow(account.account_id);

    return res.status(200).json({ status: 200, accounts });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong in the server!" });
  }
});

app.get("/retrieve/head", async (_req, res) => {
  const stored_accounts = await retrieveHeadDepartmentAccounts();

  const heads_info = stored_accounts.map((account: any) => {
    return { id: account.account_id, username: account.username };
  });

  return res.status(200).json({ heads: heads_info });
});

app.post("/create", async (req, res) => {
  const access_token = req.cookies.access_token;
  const account = jwt.decode(access_token) as JwtPayload;

  try {
    const new_account = {
      username: req.body.new_account.username,
      email: req.body.new_account.email,
      password: await bcrypt.hash(req.body.new_account.password, 10),
      role_id: await retrieveRoleId(req.body.new_account.role),
      reports_to: req.body.new_account.reportingTo,
    };

    return await createAccount(new_account).then((_) => {
      console.log(
        "A new account was created by account id: ",
        account.account_id
      );
      return res.status(200).json({ status: 200, message: "account created!" });
    });
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Error: Something went wrong when creating account!",
    });
  }
});

export default app;
