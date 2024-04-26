import { getAccountRole } from "@services/userService";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export default async function roleMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const access_token = req.cookies.access_token;

  if (access_token) {
    try {
      const account = jwt.decode(access_token) as JwtPayload;

      const stored_role = await getAccountRole(account.account_id);

      if (!stored_role || stored_role !== account.role) {
        return res.status(401).json({ message: "Not Authorized!" });
      }
      // Check if account is allowed to access resource
      if (stored_role !== "admin" && stored_role !== "head") {
        return res.status(401).json({ message: "Not Authorized!" });
      }
      next();
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Something wen't wrong in the server!" });
    }
  } else {
    return res.status(401).json({ message: "Access token missing" });
  }
}
