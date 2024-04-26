import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import {
  removeRefreshToken,
  retrieveRefreshToken,
} from "@services/authService";

export default async function tokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.access_token;

  if (token) {
    try {
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET ?? "access_token_secret"
      );
      next();
    } catch (err) {
      const account = jwt.decode(token) as JwtPayload;
      const account_id = account?.account_id;

      // if access_token expired, check for refresh_token
      if (err instanceof jwt.TokenExpiredError) {
        const refreshToken = await retrieveRefreshToken(account_id);
        if (refreshToken.length === 0 || refreshToken[0].token === undefined) {
          return res.status(401).json({ message: "Invalid Token" });
        }

        try {
          jwt.verify(
            refreshToken[0].token,
            process.env.REFRESH_TOKEN_SECRET ?? "refresh_token_secret"
          ); // verify refresh token

          const accessToken = jwt.sign(
            { account_id: account_id, role: account?.role },
            process.env.ACCESS_TOKEN_SECRET ?? "access_token_secret",
            { expiresIn: "30m" }
          );
          res.setHeader("Set-Cookie", accessToken);
          next();
        } catch (err) {
          // session expired, remove refresh token from db
          await removeRefreshToken(account_id);
          return res
            .status(403)
            .json({ message: "Session Timeout! Please Login Again!" });
        }
      } else {
        res.status(401).json({ message: "Invalid Token" });
      }
    }
  } else {
    return res.status(401).json({ message: "Access token missing" });
  }
}
