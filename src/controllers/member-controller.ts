import { Request, Response } from "express";
import { Member } from "../models";
import HttpStatusCodes from "../constants/https-status-codes";
import { MemberService } from "../services";
import ExcelJS from "exceljs";
import { Parser } from 'json2csv';

// Messages
const Message = {
  successSignup: "Member added successfully.",
  successVerified: "Verified success",
  success: "Success",
  successUpdate: "Member updated successfully",
  error: "An error occurred",
  NotFound: "User not found",
  alreadyExists: "A member with this phone number already exists.",
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

export interface IMemberUpdate {
  customerName: string;
  phoneNumber: string;
}
interface IReqPagination {
  query: {
    limit: string;
    page: string;
    search: string;
  };
}
export interface IRedeemMemberPoints {
    phoneNumber: string;
    points : number;
}

// Public api to get user from ordering platform and pos
export const addMemberPointsViaApi = async (req: IAddMemberViaApi, res: Response) => {
  // Signup
  const member = await MemberService.addMemberPointsViaApi(req.body);

  // Return
  return res
    .status(HttpStatusCodes.OK)
    .json({ data: member, message: Message.successSignup });
};

// Apis for web app
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
    newMember,
    message: Message.successSignup,
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
  const payload = req.body;

  const docs = await MemberService.updateMemberPoints(memberId, payload);

  return res
    .status(HttpStatusCodes.OK)
    .json({ data: docs, message: Message.success });
};

export const exportMemberExcel = async (req: Request, res: Response) => {
  try {
    const members = await Member.find().lean();

    if (!members.length) {
      return res.status(404).json({ message: 'No members found' });
    }

    const formatted = members.map((member, index) => ({
      Index: index + 1,
      'Customer Name': member.customerName,
      'Phone Number': member.phoneNumber,
      'Current Points': member.currentPoints,
      'Lifetime Points': member.lifetimePoints,
      'Total Visits': member.totalVisits,
      'Revisit Count': member.revisitCount,
      'Last Visit (DD/MM/YYYY)': member.lastVisit ? new Date(member.lastVisit).toISOString().split('T')[0] : '',
      'Created At (DD/MM/YYYY)': new Date(member.createdAt).toISOString().split('T')[0],
    }));

    const parser = new Parser();
    const csv = parser.parse(formatted);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=MemberReport-${Date.now()}.csv`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    res.send(csv);
  } catch (error) {
    console.error('Error exporting member CSV:', error);
    res.status(500).json({ message: 'Failed to export CSV' });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  const { id: memberId } = req.params;
  const payload = req.body as Partial<IMemberUpdate>;

  const phone = payload.phoneNumber;
  const member = await Member.findById(memberId);
  if (!member) {
    return res
      .status(HttpStatusCodes.NOT_FOUND)
      .json({ message: Message.NotFound });
  }
  if (phone && phone !== member.phoneNumber) {
    const phoneExists = await Member.findOne({ phoneNumber: phone });
    if (phoneExists) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ message: Message.alreadyExists });
    }
  }

  const updatedMember = await Member.findByIdAndUpdate(
    memberId,
    { $set: payload },
    { new: true } // Return the updated document
  );

  return res
    .status(HttpStatusCodes.OK)
    .json({ data: updatedMember, message: Message.successUpdate });
};

// public API

export const getMemberByPhoneNumber = async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ message: "Phone number is required" });
  }

  const member = await MemberService.findMemberByPhoneNumber(phoneNumber);

  if (!member) {
    return res.status(404).json({ message: "Member not found" });
  }

  return res.status(HttpStatusCodes.OK).json(member);
};


export const redeemMemberPoints = async (req: Request, res: Response) => {
  const { phoneNumber, points } = req.body as IRedeemMemberPoints;

  if (!phoneNumber) {
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ message: "Phone number is required" });
  }

  const member = await MemberService.redeemMemberPoints(phoneNumber, points, res);

  return res.status(HttpStatusCodes.OK).json(member);
};

