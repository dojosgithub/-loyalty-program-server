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
  successSignup: "Promotion added successfully.",
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

export const getAllAudience  = async (req: Request, res: Response) => {
  // List members in pagination
  const list = await PromotionService.getAllAudience();

  return res.status(HttpStatusCodes.OK).json(list);
};

export const getLastPromotionSent = async (req: Request, res: Response) => {

  // List members in pagination
  const lastPromotion = await PromotionService.getLastSentPromotion();

  return res.status(HttpStatusCodes.OK).json(lastPromotion);
};
