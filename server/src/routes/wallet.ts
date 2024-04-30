import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import {
  initializeWallet,
  retrieveAllWallets,
  retrieveWalletByAccountId,
} from "@services/walletService";
import {
  hasPrivilegeToCreate,
  hasPrivilegeToDerive,
} from "@services/accountService";
import tokenMiddleware from "@middleware/tokenMiddleware";
import roleMiddleware from "@middleware/roleMiddleware";

const app = express.Router();

app.use(tokenMiddleware);
app.use(roleMiddleware);

app.post("/derive", async (req, res) => {
  try {
    const access_token = req.cookies.access_token;
    const account = jwt.decode(access_token) as JwtPayload;

    // Check if account has privilege to derive
    if (await hasPrivilegeToDerive(account.account_id))
      return res.status(401).json({ message: "Not Authorized" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
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
    else wallet = await retrieveWalletByAccountId(account.account_id);

    return res.status(200).json({ wallet });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message:
        "Error: Something wen't wrong when trying to retrieve the wallets",
    });
  }
});

app.get("/create", async (req, res) => {
  try {
    const access_token = req.cookies.access_token;
    const account = jwt.decode(access_token) as JwtPayload;

    // Check if account has privilege to create a wallet
    if (await hasPrivilegeToCreate(account.account_id))
      return res.status(401).json({ message: "Not Authorized" });

    const wallet = await initializeWallet();

    return res.status(200).json({ wallet });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error: Something wen't wrong when trying to create a wallet",
    });
  }
});

export default app;
