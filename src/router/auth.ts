import { Router } from "express";
import { authController } from "../controllers";
import { AuthenticateMW } from "../middleware";
import { asyncHandler } from "../util/async-handles";
import PathsV1 from "./paths";

const authRouter: Router = Router({ mergeParams: true });

//? @api  = /api/signup
//? @desc = Register a new user
authRouter.post(PathsV1.Auth.Signup, asyncHandler(authController.signup));

authRouter.post(PathsV1.Auth.login, asyncHandler(authController.login));

export { authRouter };
