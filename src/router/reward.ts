import { Router } from "express";
import { rewardController } from "../controllers";
import { asyncHandler } from "../util/async-handles";
import PathsV1 from "./paths";
import { AuthenticateMW } from "../middleware";

const rewardRouter: Router = Router({ mergeParams: true });

//? @api  = /api/add-reward
//? @desc = Add a new reward
rewardRouter.post(PathsV1.Reward.add, asyncHandler(rewardController.addReward));

//? @api  = /api/rewards
//? @desc = gets list of rewards
rewardRouter.get(PathsV1.Reward.list, asyncHandler(AuthenticateMW), asyncHandler(rewardController.getAllRewards));

//? @api  = /api/reward/:id
//? @desc = update reward by ID
rewardRouter.put(
  PathsV1.Reward.edit,
  asyncHandler(AuthenticateMW),
  asyncHandler(rewardController.updateReward)
);

//? @api  = /api/reward/:id
//? @desc = update reward by ID
rewardRouter.delete(
  PathsV1.Reward.delete,
  asyncHandler(AuthenticateMW),
  asyncHandler(rewardController.deleteReward)
);

export { rewardRouter };
