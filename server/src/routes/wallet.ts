import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import {
  deriveWallet,
  retrieveAllDepartmentWallets,
  retrieveAllWallets,
  retrieveWalletByAccountId,
  retrieveWalletByAddress,
} from "@services/walletService";
import {
  getAccountDepartment,
  getAccountRole,
  hasPrivilegeToDerive,
  hasPrivilegeToViewWallet,
} from "@services/accountService";
import tokenMiddleware from "@middleware/tokenMiddleware";
import roleMiddleware from "@middleware/roleMiddleware";
import { retrieveWalletInfo } from "@services/blockcypherService";

const app = express.Router();

app.use(tokenMiddleware);

app.post("/derive", roleMiddleware, async (req, res) => {
  try {
    const access_token = req.cookies.access_token;
    const account = jwt.decode(access_token) as JwtPayload;
    const recipient_account = req.body;

    // Check if account has privilege to derive
    if (!(await hasPrivilegeToDerive(account.account_id)))
      return res.status(401).json({ message: "Not Authorized" });

    const account_role = await getAccountRole(recipient_account.account_id);
    await deriveWallet(recipient_account.account_id, account_role);

    return res
      .status(200)
      .json({ status: 200, message: "Successfully derived wallet!" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Error: Something wen't wrong when trying to derive a wallet",
      error: err.message,
    });
  }
});

app.post("/retrieve", async (req, res) => {
  try {
    const access_token = req.cookies.access_token;
    const account = jwt.decode(access_token) as JwtPayload;

    let wallet = null;
    if (account.role === "admin") wallet = await retrieveAllWallets();
    else if (account.role === "head") {
      const department_id = (await getAccountDepartment(account.account_id))
        .department_id;
      wallet = await retrieveAllDepartmentWallets(department_id);
    } else wallet = await retrieveWalletByAccountId(account.account_id);

    return res.status(200).json({ status: 200, wallet });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message:
        "Error: Something wen't wrong when trying to retrieve the wallets",
    });
  }
});

app.get("/info/:address", async (req, res) => {
  try {
    const access_token = req.cookies.access_token;
    const account = jwt.decode(access_token) as JwtPayload;
    const address = req.params.address;

    if (
      !(await hasPrivilegeToViewWallet(
        account.account_id,
        account.role,
        address
      ))
    )
      return res.status(401).json({
        status: 401,
        message: "Not authorized!",
      });

    const wallet_info = await retrieveWalletInfo(address);
    const wallet_owner = (await retrieveWalletByAddress(address)).account_id;

    return res.status(200).json({
      status: 200,
      message: "Successfully retrieved wallet information",
      owner: wallet_owner,
      wallet_info: wallet_info,
    });
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message:
        "Error: Something went wrong when trying to retrieve your wallet information",
      error: err.message,
    });
  }
});

export default app;
