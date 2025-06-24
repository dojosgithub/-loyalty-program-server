import _, { escapeRegExp } from "lodash";
import HttpStatusCodes from "../constants/https-status-codes";
import { Member } from "../models";
import { PROMOTION_STATUS, tick } from "../util/misc";
import {  Promotion } from "../models/promotion";
import { Announcement, IAnnouncement } from "../models/announcement";


export const Errors = {
  Unauth: "Unauthorized",
  EmailNotFound(email: string) {
    return `User with email ${email} not found`;
  },
  EmailAlreadyExists(email: string) {
    return `An account with this email or username already exists`;
  },
  NoEmail: "Please enter a valid email",
  NoAccount: "Account does not exist",
  InvalidOrExpired: "Token is invalid or expired",
  AccountNotVerified: "Please confirm your account and try again",
  InvalidLogin: "Incorrect email or password",
  PasswordNotMactch: "Your previous password does not match",
  PrevPassShouldNotMatch:
    "Your previous password should not match with your new password",
  InvalidEmailToken: "Invalid token",
  ParamFalsey: "Param is falsey",
} as const;

interface paginationParams {
  page: number;
  limit: number;
}


export const addAnnouncement = async (body: IAnnouncement) => {
  const newAnnouncement = new Announcement({
    ...body,
    status: PROMOTION_STATUS.DRAFT,
  });

  await newAnnouncement.save();
  return newAnnouncement;
};

export const getAllAnnouncements = async (params: paginationParams) => {
  const { page, limit } = params;

  let searchQuery = {};
  const paginateOptions = {
    page,
    limit,
    sort: { createdAt: -1 },
    // select: "-lifetimePoints -totalVisits",
  };

  // @ts-ignore
  const _doc = await Announcement.paginate(searchQuery, paginateOptions);

  return _doc;
};

