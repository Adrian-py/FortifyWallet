import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import {
  deleteAuthorizationCode,
  retrieveAuthorizationCode,
  saveAuthorizationCode,
  removeRefreshToken,
  retrieveRefreshToken,
  saveRefreshToken,
} from "@services/authService";
import tokenMiddleware from "@middleware/tokenMiddleware";
import { retrieveAccount, getAccountRole } from "@services/userService";

const app = express.Router();

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login Attempt: login attempt by " + username);

  const account = await retrieveAccount(username);
  if (account.length === 0)
    return res
      .status(400)
      .json({ status: 400, message: "Invalid username or password" });

  const match_password = await bcrypt.compare(password, account[0].password);
  if (!match_password)
    return res
      .status(400)
      .json({ status: 400, message: "Invalid username or password" });

  const authorization_code = uuidv4();
  await deleteAuthorizationCode(account[0].account_id ?? "");
  await saveAuthorizationCode(account[0].account_id ?? "", authorization_code);

  return res.status(200).json({ status: 200, authorization_code });
});

app.post("/logout", tokenMiddleware, async (req, res) => {
  try {
    const { account_id } = req.body;
    const access_token = req.cookies.access_token;

    if (!account_id) {
      return res.status(400).json({ status: 400, message: "Bad Request!" });
    }

    // Verify given account_id is equal to account_id in access_token
    const decoded = jwt.decode(access_token) as JwtPayload;
    if (account_id !== decoded.account_id) {
      return res.status(401).json({ status: 401, message: "Not Authorized!" });
    }
    await removeRefreshToken(account_id);
    return res
      .status(200)
      .json({ status: 200, message: "Successfully Logged account Out!" });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something wen't wrong when trying to logout account!",
      err: err,
    });
  }
});

app.post("/token", async (req, res) => {
  const { authorization_code } = req.body;

  const token = await retrieveAuthorizationCode(authorization_code);
  if (token.length === 0)
    return res.status(400).json({ message: "Invalid authorization code" });
  const account_id = token[0].account_id;
  const role = await getAccountRole(account_id);

  const accessToken = jwt.sign(
    { account_id: account_id, role: role },
    process.env.ACCESS_TOKEN_SECRET ?? "access_token_secret",
    { expiresIn: "30m" }
  );
  const refreshToken = jwt.sign(
    { account_id: account_id, role: role },
    process.env.REFRESH_TOKEN_SECRET ?? "refresh_token_secret",
    { expiresIn: "1h" }
  );

  await deleteAuthorizationCode(account_id);

  // if a refresh token already exists in db, remove it and save the new one
  if ((await retrieveRefreshToken(account_id)).length > 0)
    await removeRefreshToken(account_id);
  await saveRefreshToken(account_id, refreshToken);

  return res.status(200).json({
    status: 200,
    message: "Token sucessfully generated!",
    access_token: accessToken,
    account: { account_id, role: role },
  });
});

app.get("/status", tokenMiddleware, async (_req, res) => {
  return res.status(200).json({ status: 200, message: "Token is valid!" });
});

export default app;
