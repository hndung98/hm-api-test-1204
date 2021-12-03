import { User } from "@prisma/client";
import { Request, Response } from "express";

export type Req = {
  user: User;
  files: any;
  redata: any;
  error: any;
} & Request;

export type Res = Response;

export type Serv = (req?: Req, res?: Res) => any;