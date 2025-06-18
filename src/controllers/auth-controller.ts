import { Request, Response } from "express";
import { User } from "../models";
import HttpStatusCodes from "../constants/https-status-codes";
import { AuthService } from "../services";
import sessionUtil from "../util/session-util";
import axios from "axios";

// Messages
const Message = {
  successSignup: "Sign up successful.",
  successVerified: "Verified success",
  success: "Success",
  error: "An error occurred",
  NotFound: "User not found",
} as const;

export interface ISignupReq {
  body: {
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    phone: string;
  };
}

interface ILoginReq {
  body: {
    email: string;
    password: string;
  };
  ip: string;
}

export const signup = async (req: ISignupReq, res: Response) => {
  // Signup
  const user = await AuthService.signup(req.body);

  // Return
  return res
    .status(HttpStatusCodes.OK)
    .json({ message: Message.successSignup });
};

/**
 * Login a user.
 */
export const login = async (req: ILoginReq, res: Response) => {
  const { email, password } = req.body;
  const { ip } = req;
  console.log("IP", ip);

  // Login
  const user = await AuthService.login(email, password);

  const jwtPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  // // Setup Role Cookie
  // await SessionUtil.addRoleTokenCookie(res, jwtPayload);

  // Create access token & refresh token
  const tokens = await sessionUtil.generateJWTtokens(jwtPayload, ip);

  // Setup Refresh token Cookie
  await sessionUtil.addRefreshTokenCookie(res, tokens.refreshToken);

  return res
    .status(HttpStatusCodes.OK)
    .json({ user, token: tokens.accessToken });
};