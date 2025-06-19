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

export interface IAddMemberViaApi {
  body: {
    customerName: string;
    phoneNumber: string;
    amount: number;
  };
}
export interface IAddMember {
  body: {
    customerName: string;
    phoneNumber: string;
  };
}

interface IReqPagination  {
  query: {
    limit: string;
    page: string;
    search: string;
  };
}

// Public api to get user from ordering platform and pos
export const addMemberViaApi = async (req: IAddMemberViaApi, res: Response) => {
  // Signup
  const member = await MemberService.addMemberViaAPI(req.body);

  // Return
  return res
    .status(HttpStatusCodes.OK)
    .json({ data: member, message: Message.successSignup });
};

export const addMember = async (req: IAddMember, res: Response) => {
  const body = req.body;

  const existingMember = await Member.findOne({
    phoneNumber: body.phoneNumber,
  });

  if (existingMember) {
    return res.status(HttpStatusCodes.BAD_REQUEST).json({
      message: "A member with this phone number already exists.",
    });
  }
  const newMember = new Member({
    customerName: body.customerName,
    currentPoints: 0,
    lifetimePoints: 0,
    totalVisits: 0,
    lastVisit: null,
    phoneNumber: body.phoneNumber,
  });

  await newMember.save();

  return res.status(HttpStatusCodes.OK).json({
    data: newMember,
    message: Message.successSignup 
  });
};

export const getAllMembers = async (req: IReqPagination, res: Response) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || "";

  // List members in pagination
  const response = await MemberService.getAllMembers({ page, limit, search });

  return res.status(HttpStatusCodes.OK).json(response);
};

export const updateMemberPoints = async (req: Request, res: Response) => {
  const { id: memberId } = req.params;
  const payload = req.body 

  const docs = await MemberService.updateMemberPoints(
    memberId, payload);

  return res.status(HttpStatusCodes.OK).json({data:docs, message: Message.success });
};

