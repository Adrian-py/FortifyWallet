import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import {
  initializeWallet,
  retrieveWalletByAccountId,
} from "@services/walletService";
import tokenMiddleware from "@middleware/tokenMiddleware";
import { hasPrivilegeToCreate } from "@services/userService";

const app = express.Router();

app.use(tokenMiddleware);

app.post("/retrieve", async (req, res) => {
  try {
    const access_token = req.cookies.access_token;
    const account = jwt.decode(access_token) as JwtPayload;

    const wallet = await retrieveWalletByAccountId(account.account_id);

    return res.status(200).json({ wallet });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message:
        "Error: Something wen't wrong when trying to retrieve your wallets",
    });
  }
});

app.get("/create", async (req, res) => {
  const access_token = req.cookies.access_token;
  const account = jwt.decode(access_token) as JwtPayload;

  // Check if account has privilege to create a wallet
  const has_privilege = await hasPrivilegeToCreate(account.account_id);
  if (!has_privilege)
    return res.status(401).json({ message: "Not Authorized" });

  const wallet = await initializeWallet();

  return res.status(200).json({ wallet });
});

export default app;
