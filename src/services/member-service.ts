import _, { escapeRegExp } from "lodash";
import { Activity, Member } from "../models";
import HttpStatusCodes from "../constants/https-status-codes";
import { Response } from "express";
import { ACTIVITY_TYPE } from "../util/misc";

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
  customerName?: string;
  phoneNumber?: string;
  currentPoints?: number;
  lastVisit?: NativeDate | null;
  lifetimePoints?: number;
  totalVisits?: number;
  pointAdjustment?: number; // Optional field for point adjustment
}

interface IPointAdjustment {
  pointAdjustment?: number; // Optional field for point adjustment
}

export const addMemberPointsViaApi = async (
  reqBody: IMemberViaAPI
) => {
  const { customerName, phoneNumber, amount } = reqBody;
  console.log(typeof amount, amount);

  // Check user exists
  const member = await Member.findOne({ phoneNumber: phoneNumber });
  if (member) {
    if (member.customerName === "TEMP_USER") {
      member.customerName = customerName;
      await member.save();
    }
    member.currentPoints = (member.currentPoints || 0) + amount;
    member.lifetimePoints = (member.lifetimePoints || 0) + amount;
    await member.save();
    const _newActivity = {
      newUser: false,
      activityType: ACTIVITY_TYPE.EARNED,
      activityDate: new Date(),
      activityPoints: amount,
      member: member._id,
    };
    const _activity = new Activity(_newActivity);
    await _activity.save();
    return member;
  }
};

export const getAllMembers = async (params: paginationParams) => {
  const { page, limit, search } = params;

  const paginateOptions = {
    page,
    limit,
  };

  const pipeline: any[] = [];

  // Handle search
  if (!_.isEmpty(search) && !_.isUndefined(search)) {
    const documentMatchKeys = ["customerName", "phoneNumber"];
    const orQueryArray = documentMatchKeys.map((key) => ({
      [key]: { $regex: new RegExp(escapeRegExp(search), "gi") },
    }));

    pipeline.push({
      $match: {
        $or: orQueryArray,
      },
    });
  }

  // Sort by createdAt (descending)
  pipeline.push({
    $sort: { createdAt: -1 },
  });

  const aggregate = Member.aggregate(pipeline);

  // @ts-ignore
  const _doc = await Member.aggregatePaginate(aggregate, paginateOptions);

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
  if (
    payload.pointAdjustment &&
    payload.pointAdjustment !== 0 &&
    payload.pointAdjustment > 0
  ) {
    const adjustment = payload.pointAdjustment;
    const oldPoints = member.currentPoints || 0;
    member.currentPoints = adjustment;
    const lifetimepointsAdjustment = adjustment - oldPoints;
    member.lifetimePoints =
      (member.lifetimePoints || 0) + lifetimepointsAdjustment;
    await member.save();

    return member;
  }
  return member;
};

// public API service

export const findMemberByPhoneNumber = async (phoneNumber: string) => {
  return await Member.findOne({ phoneNumber }).select("currentPoints");
};

export const redeemMemberPoints = async (
  phoneNumber: string,
  points: number,
  res: Response
) => {
  const member = await Member.findOne({ phoneNumber });
  if (!member) {
    res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ message: "Member not found" });
  }
  if (member && member?.currentPoints >= points) {
    member.currentPoints -= points;
    member.totalVisits += 1;
    member.revisitCount = member.totalVisits;
    member.lastVisit = new Date();
    await member.save();
    const _newActivity = {
      newUser: false,
      activityType: ACTIVITY_TYPE.REDEEM,
      activityDate: new Date(),
      activityPoints: points,
      member: member._id,
    };
    const _activity = new Activity(_newActivity);
    await _activity.save();
    return member;
  } else {
    res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ message: "Insufficient points" });
  }
};
