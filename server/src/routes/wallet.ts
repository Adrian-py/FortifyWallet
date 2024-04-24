import express from "express";

import {
  initializeWallet,
  retrieveWalletByUserId,
} from "@services/walletService";
import tokenMiddleware from "middleware/tokenMiddleware";
import { hasPrivilegeToCreate } from "@services/userService";

const app = express.Router();

app.use(tokenMiddleware);

app.get("/wallets", async (req, res) => {
  const { user_id } = req.body;

  const wallet = await retrieveWalletByUserId(user_id);

  return res.status(200).json({ wallet });
});

app.get("/create", async (req, res) => {
  const { user_id } = req.body;

  // check if user has privilege to create a wallet
  const has_privilege = await hasPrivilegeToCreate(user_id);
  if (!has_privilege) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const wallet = await initializeWallet();

  return res.status(200).json({ wallet });
});

export default app;
