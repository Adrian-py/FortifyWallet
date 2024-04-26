import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import roleMiddleware from "@middleware/roleMiddleware";
import tokenMiddleware from "@middleware/tokenMiddleware";
import { retrieveAccountsBelow } from "@services/userService";

const app = express.Router();

app.use(tokenMiddleware);
app.use(roleMiddleware);

app.get("/retrieve", async (req, res) => {
  try {
    const access_token = req.cookies.access_token;

    const account = jwt.decode(access_token) as JwtPayload;

    const accounts = await retrieveAccountsBelow(account.account_id);

    return res.status(200).json({ status: 200, accounts });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong in the server!" });
  }
});

app.post("/create", async (req, res) => {
  console.log(req.body);
  return res.status(200).json({ message: "account created!" });
});

export default app;
