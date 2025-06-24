import { Request, Response } from "express";
import { IReward } from "../models";
import HttpStatusCodes from "../constants/https-status-codes";
import { RewardService} from "../services";

// Messages
const Message = {
  successSignup: "Reward added successfully.",
  successVerified: "Verified success",
  success: "Success",
  error: "An error occurred",
  NotFound: "User not found",
} as const;
interface IReqPagination {
  query: {
    limit: string;
    page: string;
    search: string;
  };
}

export const addReward = async (req: Request, res: Response) => {
  const body = req.body as IReward;

  const reward = await RewardService.addReward(body);

  return res.status(HttpStatusCodes.OK).json({
    reward,
    message: Message.successSignup,
  });
};

export const getAllRewards = async (req: IReqPagination, res: Response) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  // List members in pagination
  const list = await RewardService.getAllRewards({ page, limit });

  return res.status(HttpStatusCodes.OK).json(list);
};

export const updateReward = async (req: Request, res: Response) => {
  const { id: rewardId } = req.params;
  const payload = req.body;

  const docs = await RewardService.updateReward(rewardId, payload);

  return res
    .status(HttpStatusCodes.OK)
    .json({ data: docs, message: Message.success });
};
