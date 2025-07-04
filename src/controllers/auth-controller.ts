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

export interface ISendTotp {
  body: {
    phoneNumber: string;
  };
}

export interface IVerifyTotp {
  body: {
    phoneNumber: string;
    token: string;
  };
}

export const sendToken = async (req: ISendTotp, res: Response) => {
  // Signup
  const body = req.body 
  const token = await AuthService.sendToken(body);

  // Return
  return res
    .status(HttpStatusCodes.OK)
    .json({token: token, message: Message.successSignup });
};

/**
 * Login a user.
 */
export const verifyToken = async (req: IVerifyTotp, res: Response) => {
  const { phoneNumber, token } = req.body;

  // Login
  const user = await AuthService.verifyToken(phoneNumber, token);

  return res
    .status(HttpStatusCodes.OK)
    .json({ user });
};