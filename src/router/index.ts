import { Router, Request, Response, NextFunction } from "express";
import { userUsersRouter } from "./user";
import { authRouter } from "./auth";
import Paths from "./paths"; 
import { memberRouter } from "./member";
import { promotionRouter } from "./promotion";
import { announcementRouter } from "./announcement";
import { rewardRouter } from "./reward";

const router: Router = Router({ mergeParams: true });

// Optional: Set global headers
router.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// Mount user routes using base path from constants
router.use(Paths.Users.Base, userUsersRouter);
router.use(authRouter);
router.use(memberRouter);
router.use(promotionRouter);
router.use(announcementRouter);
router.use(rewardRouter);

export { router };
