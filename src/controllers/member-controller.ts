import { Request, Response } from "express";
import { Member, User } from "../models";
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

// Public api to get user from ordering platform and pos
export const addMemberViaApi = async (req: ISignupReq, res: Response) => {
  // Signup
  const member = await MemberService.addMemberViaAPI(req.body);

  // Return
  return res
    .status(HttpStatusCodes.OK)
    .json({ data: member, message: Message.successSignup });
};

export const addMember = async (req: ISignupReq, res: Response) => {
  const body = req.body;

  const existingMember = await Member.findOne({
    phoneNumber: body.phoneNumber,
  });

  if (existingMember) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      message: "A member with this phone number already exists.",
      data: existingMember,
    });
  }
  const newMember = new Member({
    customerName: body.customerName,
    currentPoints: body.amount,
    lifetimePoints: body.amount,
    totalVisits: 1,
    lastVisit: new Date(),
    phoneNumber: body.phoneNumber,
  });

  await newMember.save();

  return res.status(HttpStatusCodes.OK).json({
    data: newMember,
    message: Message.successSignup 
  });
};
