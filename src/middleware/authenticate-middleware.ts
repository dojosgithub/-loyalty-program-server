/**
 * Middleware to verify accessed token and authenticate user for private routes
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import _ from "lodash";
import HttpStatusCodes from "../constants/https-status-codes";
import EnvVars from "../constants/env-variables"

// ----------------------------------------

const USER_UNAUTHORIZED_ERR = "User not authorized to perform this action";

export interface ISessionReq extends Request {
  _session: any;
}

export const AuthenticateMW = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //   const { role } = req.body;

  let token: string = req.headers["authorization"] ?? "";

  if (_.isEmpty(token))
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ error: USER_UNAUTHORIZED_ERR });

  if (token.startsWith("Bearer "))
    token = token.slice(7, token.length).trimLeft();

  try {
    const payload = jwt.verify(token, EnvVars.Jwt.default.Secret);
    
    //@ts-ignore
    req._session = payload;

    // const refreshTokens = await RefreshToken.find({ user: payload._id });
    // req.user.ownsToken = (token) =>
    //   !!refreshTokens.find((x) => x.token === token);

    return next();
  } catch (error) {
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
  }
};
