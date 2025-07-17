import _, { escapeRegExp } from "lodash";
import { formatToDDMMYYYY, PROMOTION_STATUS, tick } from "../util/misc";
import { Announcement, IAnnouncement } from "../models/announcement";
import * as SMSUtils from "../util/sms-utils";
import { Member } from "../models";

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

  const numbers = await Member.find({}).select("phoneNumber").lean();
  let userPhones = [] as string[];
  const num = numbers.map((number) => {
    if (number.phoneNumber) {
      userPhones.push(number.phoneNumber);
    }
  });

  const params = {
    description: body.description,
    message: body.message,
  };

  await newAnnouncement.save();
  await SMSUtils.sendAnnouncements(userPhones, params);
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
    const aggregate = Announcement.aggregate([
    { $sort: { createdAt: -1 } }, // sort directly in the pipeline
  ]);

  // @ts-ignore
  const _doc = await Reward.Announcement(aggregate, paginateOptions);

  return _doc;
};
