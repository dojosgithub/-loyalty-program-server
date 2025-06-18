import { Router } from "express";
import {  memberController } from "../controllers";
import { asyncHandler } from "../util/async-handles";
import PathsV1 from "./paths";

const memberRouter: Router = Router({ mergeParams: true });

//? @api  = /api/signup
//? @desc = Register a new user
memberRouter.post(PathsV1.Member.add, asyncHandler(memberController.addMemberViaApi));

export { memberRouter };
