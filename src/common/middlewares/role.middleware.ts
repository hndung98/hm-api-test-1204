import { NextFunction, Response } from "express";
import { Req } from "../types/api.type";

export default function permit(...permittedRoles: string[]) {
  return async (req: Req, res: Response, next: NextFunction) => {
    const { user } = req;
    if (user && permittedRoles.includes(user.role)) {
      next();
    } else {
      return res.status(403).json({ error: "Invalid credentials" });
    }
  };
}
