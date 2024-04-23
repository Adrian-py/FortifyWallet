import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import { retrieveUser } from "@services/databaseService";
import {
  deleteAuthorizationCode,
  getAuthorizationCode,
  saveAuthorizationCode,
  saveRefreshToken,
} from "@services/authService";

const app = express.Router();

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await retrieveUser(username);
  if (user.length === 0)
    return res.status(400).json({ message: "Invalid username or password" });

  const match_password = await bcrypt.compare(password, user[0].password);
  if (!match_password)
    return res.status(400).json({ message: "Invalid username or password" });

  const authorization_code = uuidv4();
  saveAuthorizationCode(user[0].user_id, authorization_code);

  res.status(200).json({ authorization_code });
});

app.post("/token", async (req, res) => {
  const { authorization_code } = req.body;
  const token = await getAuthorizationCode(authorization_code);
  const user_id = token[0].user_id;

  const accessToken = jwt.sign(
    { userId: user_id },
    process.env.ACCESS_TOKEN_SECRET ?? "access_token_secret",
    { expiresIn: "30m" }
  );
  const refreshToken = jwt.sign(
    { userId: user_id },
    process.env.REFRESH_TOKEN_SECRET ?? "refresh_token_secret",
    { expiresIn: "2h" }
  );

  await deleteAuthorizationCode(user_id);

  await saveRefreshToken(user_id, refreshToken);
  res.status(200).json({ accessToken });
});

export default app;
