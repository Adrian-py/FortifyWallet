import express from "express";

import {
  initializeWallet,
  retrieveWalletByaccount_id,
} from "@services/walletService";
import tokenMiddleware from "@middleware/tokenMiddleware";
import { hasPrivilegeToCreate } from "@services/userService";

const app = express.Router();

app.use(tokenMiddleware);

app.post("/retrieve", async (req, res) => {
  try {
    const { account_id } = req.body;

    const wallet = await retrieveWalletByaccount_id(account_id);

    return res.status(200).json({ wallet });
  } catch (err) {
    return res.status(500).json({
      message:
        "Error: Something wen't wrong when trying to retrieve your wallets",
    });
  }
});

app.get("/create", async (req, res) => {
  const { account_id } = req.body;

  // check if account has privilege to create a wallet
  const has_privilege = await hasPrivilegeToCreate(account_id);
  if (!has_privilege) {
    return res.status(401).json({ message: "Not Authorized" });
  }

  const wallet = await initializeWallet();

  return res.status(200).json({ wallet });
});

export default app;
