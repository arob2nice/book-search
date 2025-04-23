import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request to include `user`
declare module "express-serve-static-core" {
  interface Request {
    user?: TokenPayload | null;
  }
}

interface TokenPayload {
  _id: string;
  username: string;
}

// Generate a signed JWT
export const signToken = (user: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET in environment variables");
  }

  return jwt.sign(user, secret, { expiresIn: "2h" });
};

// Express middleware to authenticate requests via JWT
const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, secret as string) as TokenPayload;
    req.user = decoded;
  } catch {
    req.user = null;
  }

  next();
};

export default authMiddleware;
