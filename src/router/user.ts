import { Router } from "express";
import { userController } from "../controllers";
import { AuthenticateMW } from "../middleware";
import { asyncHandler } from "../util/async-handles";

const userUsersRouter: Router = Router({ mergeParams: true });

//? @api  = /api/v1/user
//? @desc = Create a new user
userUsersRouter.post("/", userController.createUser);

//? @api  = /api/v1/user
//? @desc = Get current logged-in user's data
userUsersRouter.get("/", asyncHandler(AuthenticateMW), userController.getAllUsers);

//? @api  = /api/v1/user/:id
//? @desc = Get a specific user by ID
userUsersRouter.get("/:id", asyncHandler(AuthenticateMW), asyncHandler(userController.getUserById));

//? @api  = /api/v1/user/:id
//? @desc = Update a specific user by ID
userUsersRouter.put("/:id", asyncHandler(AuthenticateMW), asyncHandler(userController.updateUser));

//? @api  = /api/v1/user/:id
//? @desc = Delete a specific user by ID
userUsersRouter.delete("/:id", asyncHandler(AuthenticateMW), asyncHandler(userController.deleteUser));

export { userUsersRouter };
