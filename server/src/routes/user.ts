import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import roleMiddleware from "@middleware/roleMiddleware";
import tokenMiddleware from "@middleware/tokenMiddleware";
import { retrieveUsersBelow } from "@services/userService";

const app = express.Router();

app.use(tokenMiddleware);
app.use(roleMiddleware);

app.get("/retrieve", async (req, res) => {
  try {
    const access_token = req.cookies.access_token;

    const user = jwt.decode(access_token) as JwtPayload;

    const users = await retrieveUsersBelow(user.user_id);

    return res.status(200).json({ status: 200, users });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong in the server!" });
  }
});

export default app;
