import { Request, Response } from "express";
import { Member, User } from "../models";
import HttpStatusCodes from "../constants/https-status-codes";
import { AuthService } from "../services";
import sessionUtil from "../util/session-util";
import axios from "axios";
import { sendSMS } from "../util/sms-utils";

// Messages
const Message = {
  successSignup: "Sign up successful.",
  successSignin: "Login Successful!",
  otpSentSuccess: "OTP sent successfully.",
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

interface ISendSMS {
  body: {
    phoneNumber: string;
    sms: string;
  };
}

export const sendToken = async (req: ISendTotp, res: Response) => {
  // Signup
  const body = req.body;
  const token = await AuthService.sendToken(body);

  // Return
  return res
    .status(HttpStatusCodes.OK)
    .json({ token: token, message: Message.otpSentSuccess });
};

/**
 * Login a user.
 */
export const verifyToken = async (req: IVerifyTotp, res: Response) => {
  const { phoneNumber, token } = req.body;

  // Login
  const user = await AuthService.verifyToken(phoneNumber, token, res);

  return res
    .status(HttpStatusCodes.OK)
    .json({ user, message: Message.successSignin });
};

export const sendMessage = async (req: ISendSMS, res: Response) => {
  const { phoneNumber, sms } = req.body;

  // Login
  // const user = await AuthService.verifyToken(phoneNumber, token, res);
  // const response = await sendSMS(sms, phoneNumber);
  // console.log(response);
const response = await Member.find({}).select('phoneNumber').lean();
  return res
    .status(HttpStatusCodes.OK)
    .json({ response, message: "Message send successfully" });
};
