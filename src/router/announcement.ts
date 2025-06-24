import { Router } from "express";
import {  announcementController } from "../controllers";
import { asyncHandler } from "../util/async-handles";
import PathsV1 from "./paths";
import { AuthenticateMW } from "../middleware";

const announcementRouter: Router = Router({ mergeParams: true });

//? @api  = /api/add-loyal-member
//? @desc = Register a new member via API
announcementRouter.post(PathsV1.Announcement.add, asyncHandler(announcementController.addAnnouncement));

//? @api  = /api/promotions
//? @desc = gets list of promotions
announcementRouter.get(PathsV1.Announcement.list, asyncHandler(AuthenticateMW), asyncHandler(announcementController.getAllAnnouncements));

export { announcementRouter };
