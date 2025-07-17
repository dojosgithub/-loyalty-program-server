import { Router } from "express";
import { activityController } from "../controllers";
import { AuthenticateMW } from "../middleware";
import { asyncHandler } from "../util/async-handles";
import PathsV1 from "./paths";

const activityRouter: Router = Router({ mergeParams: true });

//? @api  = /api/activity
//? @desc = get all activities
activityRouter.get(PathsV1.Activity.list, asyncHandler(activityController.getAllActivities));

//? @api  = /api/activity
//? @desc = get all activities
activityRouter.get(PathsV1.Activity.points, asyncHandler(activityController.getAllActiviyPoints));

//? @api  = /api/download-members
//? @desc = download members list
activityRouter.get(PathsV1.Activity.download, asyncHandler(AuthenticateMW), asyncHandler(activityController.exportActivity));


//? @api  = /api/dashboard-activity
//? @desc = dashboard api for activity
activityRouter.post(PathsV1.Activity.dashboardChart, asyncHandler(AuthenticateMW), asyncHandler(activityController.getAllActiviyDashboard));

//? @api  = /api/recent-activity
//? @desc = dashboard api for activity
activityRouter.get(PathsV1.Activity.recentActivitydashboard, asyncHandler(AuthenticateMW), asyncHandler(activityController.getAllRecentActiviyDashboard));


export { activityRouter };
