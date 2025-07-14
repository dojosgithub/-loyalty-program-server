import { Router } from "express";
import { authController } from "../controllers";
import { AuthenticateMW } from "../middleware";
import { asyncHandler } from "../util/async-handles";
import PathsV1 from "./paths";

const authRouter: Router = Router({ mergeParams: true });

//? @api  = /api/send-totp
//? @desc = Register a new user
authRouter.post(PathsV1.Auth.sendTOTP, asyncHandler(authController.sendToken));

authRouter.post(PathsV1.Auth.verifyTOTP, asyncHandler(authController.verifyToken));

authRouter.post(PathsV1.Auth.sendSMS, asyncHandler(authController.sendMessage));

export { authRouter };
