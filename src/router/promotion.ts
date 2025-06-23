import { Router } from "express";
import {  memberController, promotionController } from "../controllers";
import { asyncHandler } from "../util/async-handles";
import PathsV1 from "./paths";
import { AuthenticateMW } from "../middleware";

const promotionRouter: Router = Router({ mergeParams: true });

//? @api  = /api/add-loyal-member
//? @desc = Register a new member via API
promotionRouter.post(PathsV1.Promotion.add, asyncHandler(promotionController.addPromotion));

//? @api  = /api/add-member
//? @desc = Register a new member
// promotionRouter.post(PathsV1.Promotion.add,asyncHandler(AuthenticateMW), asyncHandler(memberController.addMember));

//? @api  = /api/promotions
//? @desc = gets list of promotions
promotionRouter.get(PathsV1.Promotion.list, asyncHandler(AuthenticateMW), asyncHandler(promotionController.getAllPromotions));

//? @api  = /api/member/:id
//? @desc = update member by ID
promotionRouter.put(
  PathsV1.Promotion.edit,
  asyncHandler(AuthenticateMW),
  asyncHandler(memberController.updateMemberPoints)
);

//? @api  = /api/download-members
//? @desc = download members list
promotionRouter.get(PathsV1.Promotion.download, asyncHandler(AuthenticateMW), asyncHandler(memberController.exportMemberExcel));


//? @api  = /api/get-audience
//? @desc = gets all audience
promotionRouter.get(PathsV1.Promotion.audienceList, asyncHandler(AuthenticateMW), asyncHandler(promotionController.getAllAudience));


export { promotionRouter };
