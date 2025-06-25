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

//? @api  = /api/members
//? @desc = gets list of members
memberRouter.get(PathsV1.Member.list, asyncHandler(AuthenticateMW), asyncHandler(memberController.getAllMembers));

//? @api  = /api/member/:id
//? @desc = update member by ID
memberRouter.put(
  PathsV1.Member.edit,
  asyncHandler(AuthenticateMW),
  asyncHandler(memberController.updateMemberPoints)
);

//? @api  = /api/download-members
//? @desc = download members list
memberRouter.get(PathsV1.Member.download, asyncHandler(AuthenticateMW), asyncHandler(memberController.exportMemberExcel));


// PUBLIC ROUTES

//? @api  = /api/get-points
//? @desc = Get member points by phone number
memberRouter.post(PathsV1.Member.getPoints, asyncHandler(memberController.getMemberByPhoneNumber));


export { memberRouter };
