import { NextFunction, Request, Response } from "express";
import SettingsRepo from "../../repository/setting.repo";

export default async function (req: Request, res: Response, next: NextFunction) {
  await SettingsRepo.importEnviroment();
  next();
}