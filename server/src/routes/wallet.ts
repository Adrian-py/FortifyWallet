import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import {
  deriveWallet,
  initializeWallet,
  retrieveAllDepartmentWallets,
  retrieveAllWallets,
  retrieveWalletByAccountId,
} from "@services/walletService";
import {
  getAccountDepartment,
  hasPrivilegeToCreate,
  hasPrivilegeToDerive,
} from "@services/accountService";
import tokenMiddleware from "@middleware/tokenMiddleware";
import roleMiddleware from "@middleware/roleMiddleware";
import { get } from "http";

const app = express.Router();

app.use(tokenMiddleware);

app.post("/derive", roleMiddleware, async (req, res) => {
  try {
    const access_token = req.cookies.access_token;
    const account = jwt.decode(access_token) as JwtPayload;
    const recipient_account_id = req.body.account_id;

    // Check if account has privilege to derive
    if (!(await hasPrivilegeToDerive(account.account_id)))
      return res.status(401).json({ message: "Not Authorized" });

    await deriveWallet(recipient_account_id);

    return res
      .status(200)
      .json({ status: 200, message: "Successfully derived wallet!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Error: Something wen't wrong when trying to derive a wallet",
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

app.get("/create", roleMiddleware, async (req, res) => {
  try {
    const access_token = req.cookies.access_token;
    const account = jwt.decode(access_token) as JwtPayload;

    // Check if account has privilege to create a wallet
    if (await hasPrivilegeToCreate(account.account_id))
      return res.status(401).json({ message: "Not Authorized" });

    const wallet = await initializeWallet();

    return res.status(200).json({ status: 200, wallet });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Error: Something wen't wrong when trying to create a wallet",
    });
  }
});

export default app;
