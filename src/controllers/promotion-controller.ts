import { Request, Response } from "express";
import { Member, User } from "../models";
import HttpStatusCodes from "../constants/https-status-codes";
import { MemberService, PromotionService } from "../services";
import sessionUtil from "../util/session-util";
import axios from "axios";
import ExcelJS from "exceljs";
import { IPromotion } from "../models/promotion";

// Messages
const Message = {
  successSignup: "Member added successfully.",
  successVerified: "Verified success",
  success: "Success",
  error: "An error occurred",
  NotFound: "User not found",
} as const;

export interface IAddPromotion {
  body: {
    customerName: string;
    phoneNumber: string;
  };
}

interface IReqPagination {
  query: {
    limit: string;
    page: string;
    search: string;
  };
}

// Apis for web app
export const addPromotion = async (req: Request, res: Response) => {
  const body = req.body as IPromotion;

  const promotion = await PromotionService.addPromotions(body);

  return res.status(HttpStatusCodes.OK).json({
    promotion,
    message: Message.successSignup,
  });
};

export const getAllPromotions = async (req: IReqPagination, res: Response) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  // List members in pagination
  const list = await PromotionService.getAllPromotions({ page, limit });

  return res.status(HttpStatusCodes.OK).json(list);
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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Members");

    if (members.length > 0) {
      worksheet.columns = Object.keys(members[0]).map((key) => ({
        header: key,
        key: key,
      }));
      worksheet.addRows(members);
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Members-${Date.now()}.xlsx`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting Excel:", error);
    return res
      .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to export Excel" });
  }
};
