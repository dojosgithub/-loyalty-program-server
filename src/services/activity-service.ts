import _, { escapeRegExp } from "lodash";
import { Activity } from "../models";
import { parseDate } from "../util/misc";

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


export const getAllActivities = async (params: {
  page: number;
  limit: number;
  search?: string;
  startDate?: string; // Format: dd-mm-yyyy
  endDate?: string;   // Format: dd-mm-yyyy
  activityType?: string;
}) => {
  const { page, limit, search, startDate, endDate, activityType } = params;

  const searchQuery: any = {};

  // ✅ Filter by activityDate between startDate and endDate
  const start = startDate ? parseDate(startDate) : null;
  const end = endDate ? parseDate(endDate) : null;

  if (start || end) {
    searchQuery.activityDate = {};
    if (start) searchQuery.activityDate.$gte = start;
    if (end) {
      end.setHours(23, 59, 59, 999); // include whole day
      searchQuery.activityDate.$lte = end;
    }
  }

  // ✅ Filter by activity type
  if (activityType) {
    searchQuery.activityType = activityType;
  }

  // ✅ Search by phoneNumber or customerName from populated member
  if (search && search.trim()) {
    const searchRegex = new RegExp(escapeRegExp(search.trim()), "i");
    searchQuery.$or = [
      { "member.phoneNumber": searchRegex },
      { "member.customerName": searchRegex },
    ];
  }

  const paginateOptions = {
    page,
    limit,
    sort: { activityDate: -1 },
    populate: {
      path: "member",
      select: "customerName phoneNumber",
    },
  };

  // @ts-ignore
  const result = await Activity.paginate(searchQuery, paginateOptions);
  return result;
};