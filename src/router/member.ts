import { Router } from "express";
import {  memberController } from "../controllers";
import { asyncHandler } from "../util/async-handles";
import PathsV1 from "./paths";
import { AuthenticateMW } from "../middleware";

const memberRouter: Router = Router({ mergeParams: true });

//? @api  = /api/add-loyal-member
//? @desc = Register a new member via API
memberRouter.post(PathsV1.Member.loyalMemberAdd, asyncHandler(memberController.addMemberViaApi));
//? @api  = /api/add-member
//? @desc = Register a new member
memberRouter.post(PathsV1.Member.add,asyncHandler(AuthenticateMW), asyncHandler(memberController.addMember));

export { memberRouter };
