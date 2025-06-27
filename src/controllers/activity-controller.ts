import { Request, Response } from "express";
import HttpStatusCodes from "../constants/https-status-codes";
import { ActivityService } from "../services";

// Messages
const Message = {
  successSignup: "Promotion added successfully.",
  successVerified: "Verified success",
  success: "Success",
  error: "An error occurred",
  NotFound: "User not found",
} as const;

interface IReqPagination {
  query: {
    page: number;
  limit: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  activityType?: string;
  };
}

export const getAllActivities = async (req: IReqPagination, res: Response) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const search = req.query.search;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const activityType = req.query.activityType;

  // List members in pagination
  const list = await ActivityService.getAllActivities({ page, limit, search, startDate, endDate, activityType });

  return res.status(HttpStatusCodes.OK).json(list);
};