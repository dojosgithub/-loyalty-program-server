import _, { escapeRegExp } from "lodash";
import HttpStatusCodes from "../constants/https-status-codes";
import { IUser, Member, User } from "../models";
import { RouteError } from "../other/classes";
import passwordUtil from "../util/password-util";
import { tick } from "../util/misc";

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

interface IMemberViaAPI {
  customerName: string;
  phoneNumber: string;
  amount: number;
}

interface paginationParams {
  page: number;
  limit: number;
  search: string;
}

interface IMember {
  customerName: string;
  phoneNumber: string;
  currentPoints: number;
  lastVisit: NativeDate | null;
  lifetimePoints: number;
  totalVisits: number;
  pointAdjustment?: number; // Optional field for point adjustment
}

interface IPointAdjustment {
  pointAdjustment?: number; // Optional field for point adjustment
}

export const addMemberViaAPI = async (
  reqBody: IMemberViaAPI
): Promise<IMember> => {
  const { customerName, phoneNumber, amount } = reqBody;

  // Check user exists
  const member = await Member.findOne({ phoneNumber: phoneNumber });
  if (member) {
    member.currentPoints = member.currentPoints + amount;
    member.lifetimePoints = (member.lifetimePoints || 0) + amount;
    member.totalVisits = (member.totalVisits || 0) + 1;
    member.lastVisit = new Date();
    await member.save();
    return member;
  } else {
    const _newMember = {
      customerName,
      currentPoints: amount,
      lifetimePoints: amount,
      totalVisits: 1,
      lastVisit: new Date(),
      phoneNumber,
    };
    const _member = new Member(_newMember);
    await _member.save();

    return _member;
  }
};

export const getAllMembers = async (params: paginationParams) => {
  const { page, limit, search } = params;

  let searchQuery = {};
  const paginateOptions = {
    page,
    limit,
    sort: { createdAt: -1 },
    // select: "-lifetimePoints -totalVisits",
  };

  if (!_.isEmpty(search) && !_.isUndefined(search)) {
    const documentMatchKeys = ["customerName", "phoneNumber"];
    const ORqueryArray = documentMatchKeys.map((key) => ({
      [key]: { $regex: new RegExp(escapeRegExp(search), "gi") },
    }));

    searchQuery = {
      ...searchQuery,
      $and: [
        {
          $or: ORqueryArray,
        },
      ],
    };
  }

  // @ts-ignore
  const _doc = await Member.paginate(searchQuery, paginateOptions);

  return _doc;
};

export const updateMemberPoints = async (
  memberId: string,
  payload: Partial<IPointAdjustment> // Accept only fields that can be updated
) => {
  const member = await Member.findById(memberId);

  if (!member) {
    throw new Error("Member not found");
  }
  if (payload.pointAdjustment && payload.pointAdjustment !== 0 && payload.pointAdjustment > 0) {
    const adjustment = payload.pointAdjustment;
    member.currentPoints = (member.currentPoints || 0) + adjustment;
    member.lifetimePoints = (member.lifetimePoints || 0) + adjustment;
    await member.save();

    return member;
  }
return member
};
