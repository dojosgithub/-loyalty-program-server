import _ from "lodash";
import HttpStatusCodes from "../constants/https-status-codes";
import { IMember, IUser, Member, User } from "../models";
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

