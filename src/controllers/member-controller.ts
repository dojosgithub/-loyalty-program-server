import { Request, Response } from "express";
import { User } from "../models";
import HttpStatusCodes from "../constants/https-status-codes";
import { AuthService, MemberService } from "../services";
import sessionUtil from "../util/session-util";
import axios from "axios";

// Messages
const Message = {
  successSignup: "Member added successfully.",
  successVerified: "Verified success",
  success: "Success",
  error: "An error occurred",
  NotFound: "User not found",
} as const;

export interface ISignupReq {
  body: {
    customerName: string;
    phoneNumber: string;
    amount: number;
  };
}

export const addMemberViaApi = async (req: ISignupReq, res: Response) => {
  // Signup
  const member = await MemberService.addMemberViaAPI(req.body);

  // Return
  return res
    .status(HttpStatusCodes.OK)
    .json({data: member, message: Message.successSignup });
};

