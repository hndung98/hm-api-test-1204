import { NextFunction, Request, Response } from "express";
import TokenHelper from "../helpers/token.helper";
import prisma from "../helpers/prisma.helper";

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeaders = req.headers.authorization;
  const tokenString = authHeaders ? authHeaders.split(" ").reverse()[0] : null;
  if (!tokenString) return next();
  const token = await TokenHelper.verifyToken(tokenString);

  if (!token || token.error) {
    (req as any).error = "Invalid credentials";
    return next();
  }

  const user = await prisma.user.findFirst({
    where: { id: token.id },
  });

  if (!user || user.accessKey != token.accessKey) {
    (req as any).error = "Invalid credentials";
    return next();
  }

  (req as any).user = user;
  next();
}
