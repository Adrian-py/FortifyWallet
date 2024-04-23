import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { retrieveRefreshToken } from "@services/authService";

const tokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const user = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET ?? "access_token_secret"
      );
      next();
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError) {
        const refreshToken = await retrieveRefreshToken(req.body.userId);
        if (refreshToken.length === 0)
          return res.status(401).json({ message: "Invalid Token" });

        try {
          jwt.verify(
            refreshToken[0].token,
            process.env.REFRESH_TOKEN_SECRET ?? "refresh_token_secret"
          );

          const accessToken = jwt.sign(
            { userId: req.body.userId },
            process.env.ACCESS_TOKEN_SECRET ?? "access_token_secret",
            { expiresIn: "30m" }
          );
          req.headers.authorization = `Bearer ${accessToken}`;
        } catch (err) {
          return res
            .status(403)
            .json({ message: "Session Timeout! Please Login Again!" });
        }
      }
      return res
        .status(403)
        .json({ message: "Session Timeout! Please Login Again!" });
    }
  } else {
    return res.status(401).json({ message: "Access token missing" });
  }
};

export default tokenMiddleware;
