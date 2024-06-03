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
  retrieveAccountInfo,
  saveTwoFactorSecret,
  retrieveTwoFactorSecret,
  updateTwoFactorStatus,
} from "@services/accountService";
import { retrieveRoleId } from "@services/roleService";
import { checkIfDepartmentAlreadyHasHead } from "@services/departmentService";
import { deriveWallet } from "@services/walletService";
import { validateUserCredentials } from "@utils/authUtils";
import {
  enableTwoFactorAuth,
  verifyTwoFactorAuth,
} from "@services/twoFactorAuthService";

const app = express.Router();

app.use(tokenMiddleware);

app.get("/retrieve", roleMiddleware, async (req, res) => {
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

app.post("/create", roleMiddleware, async (req, res) => {
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

app.get("/info", async (req, res) => {
  const access_token = req.cookies.access_token;
  const account = jwt.decode(access_token) as JwtPayload;

  try {
    const retrieved_account = await retrieveAccountInfo(account.account_id);
    if (retrieved_account.length === 0)
      return res.status(404).json({
        status: 404,
        message: "Account not found!",
        error: "Account not found!",
      });

    const account_info = {
      username: retrieved_account[0].username,
      email: retrieved_account[0].email,
      role: retrieved_account[0].role_name,
      department: retrieved_account[0].department_name,
      enabled_two_factor: retrieved_account[0].enabled_two_factor,
    };
    return res.status(200).json({ status: 200, account: account_info });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error!",
      error: err.message,
    });
  }
});

app.get("/setup-2fa", async (req, res) => {
  const access_token = req.cookies.access_token;
  const account = jwt.decode(access_token) as JwtPayload;

  try {
    const two_factor_data = await enableTwoFactorAuth();
    await saveTwoFactorSecret(account.account_id, two_factor_data.secret);
    // TODO: Encrypt the secret before saving it to the database
    return res.status(200).json({ status: 200, two_factor_data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error!",
      error: err.message,
    });
  }
});

app.post("/verify-2fa", async (req, res) => {
  const { otp } = req.body;
  const access_token = req.cookies.access_token;
  const account = jwt.decode(access_token) as JwtPayload;

  try {
    const user_secret = await retrieveTwoFactorSecret(account.account_id);
    // TODO: Decrypt the secret before verifying the OTP
    const verified: number | null = await verifyTwoFactorAuth(user_secret, otp);
    if (verified !== 0)
      return res.status(400).json({ status: 400, error: "Invalid OTP!" });
    // For if it is first time verification, update the account's enabled-2FA status
    await updateTwoFactorStatus(account.account_id);

    // Update verified_2fa in the access token
    const accessToken = jwt.sign(
      {
        account_id: account.account_id,
        role: account?.role,
        enabled_two_factor: account?.enabled_two_factor,
        verified_2fa: true,
      },
      process.env.ACCESS_TOKEN_SECRET ?? "access_token_secret",
      { expiresIn: "30m" }
    );
    res.setHeader("Set-Cookie", accessToken);

    return res
      .status(200)
      .json({ status: 200, message: "Successfully Verified OTP!" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error!",
      error: err.message,
    });
  }
});

export default app;
