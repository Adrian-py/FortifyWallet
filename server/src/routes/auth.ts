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
import { retrieveUser, getUserRole } from "@services/userService";

const app = express.Router();

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await retrieveUser(username);
  if (user.length === 0)
    return res
      .status(400)
      .json({ status: 400, message: "Invalid username or password" });

  const match_password = await bcrypt.compare(password, user[0].password);
  if (!match_password)
    return res
      .status(400)
      .json({ status: 400, message: "Invalid username or password" });

  const authorization_code = uuidv4();
  await deleteAuthorizationCode(user[0].user_id);
  await saveAuthorizationCode(user[0].user_id, authorization_code);

  return res.status(200).json({ status: 200, authorization_code });
});

app.post("/logout", tokenMiddleware, async (req, res) => {
  try {
    const { user_id } = req.body;
    const access_token = req.cookies.access_token;

    if (!user_id) {
      return res.status(400).json({ status: 400, message: "Bad Request!" });
    }

    // Verify given user_id is equal to user_id in access_token
    const decoded = jwt.decode(access_token) as JwtPayload;
    if (user_id !== decoded.user_id) {
      return res.status(401).json({ status: 401, message: "Not Authorized!" });
    }
    await removeRefreshToken(user_id);
    return res
      .status(200)
      .json({ status: 200, message: "Successfully Logged User Out!" });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Something wen't wrong when trying to logout user!",
      err: err,
    });
  }
});

app.post("/token", async (req, res) => {
  const { authorization_code } = req.body;

  const token = await retrieveAuthorizationCode(authorization_code);
  if (token.length === 0)
    return res.status(400).json({ message: "Invalid authorization code" });
  const user_id = token[0].user_id;
  const user_role = await getUserRole(user_id);

  const accessToken = jwt.sign(
    { user_id: user_id, role: user_role },
    process.env.ACCESS_TOKEN_SECRET ?? "access_token_secret",
    { expiresIn: "30m" }
  );
  const refreshToken = jwt.sign(
    { user_id: user_id, role: user_role },
    process.env.REFRESH_TOKEN_SECRET ?? "refresh_token_secret",
    { expiresIn: "1h" }
  );

  await deleteAuthorizationCode(user_id);

  // if a refresh token already exists in db, remove it and save the new one
  if ((await retrieveRefreshToken(user_id)).length > 0)
    await removeRefreshToken(user_id);
  await saveRefreshToken(user_id, refreshToken);

  return res.status(200).json({
    status: 200,
    message: "Token sucessfully generated!",
    access_token: accessToken,
    user: { user_id, role: user_role },
  });
});

app.get("/status", tokenMiddleware, async (_req, res) => {
  return res.status(200).json({ status: 200, message: "Token is valid!" });
});

export default app;
