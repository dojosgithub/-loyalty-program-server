import _, { isEmpty } from "lodash";
import { Request, Response } from "express";
import HttpStatusCodes from "../constants/https-status-codes";
import { Activity, IUser, Member, TOTP, User } from "../models";
import { RouteError } from "../other/classes";
import passwordUtil from "../util/password-util";
import {
  ACTIVITY_TYPE,
  generateOTToken,
  tick,
  verifyTOTPToken,
} from "../util/misc";
import speakeasy from "speakeasy";

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

interface ISignupReq {
  phoneNumber: string;
}

export const sendToken = async (reqBody: ISignupReq) => {
  const { phoneNumber } = reqBody;
  const phone = phoneNumber?.replace(/[^0-9]/g, "");

  var secret = speakeasy.generateSecret({ length: 20 }).base32;
  var token = speakeasy.totp({
    digits: 6,
    secret: secret,
    encoding: "base32",
  });

  const TOTPToken = await generateOTToken({ secret });

  // Find if the document with the phoneNumber exists in the database
  let totp = await TOTP.findOneAndUpdate({ phone }, { token: TOTPToken });
  if (isEmpty(totp)) {
    await new TOTP({
      phoneNumber: phone,
      token: TOTPToken,
    }).save();
  }

  return token;
};

/**
 * Login a user.
 */
export const verifyToken = async (
  phoneNumber: string,
  tokens: string,
  res: Response
) => {
  const phone = phoneNumber?.replace(/[^0-9]/g, "");

  let totp = await TOTP.findOneAndDelete({ phoneNumber: phone }).lean();
  if (!totp) {
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ message: "No OTP record found or it has already been used." });
  }
  if (totp) {
    let decoded = await verifyTOTPToken(totp.token as string);
    let verified = speakeasy.totp.verify({
      digits: 6,
      secret: decoded.secret,
      encoding: "base32",
      token: tokens,
      window: 10,
    });
    // verified in production
    if (verified) {
      const member = await Member.findOne({ phoneNumber: phoneNumber });
      if (member) {
        member.totalVisits = (member.totalVisits || 0) + 1;
        member.lastVisit = new Date();
        (member.revisitCount = member.totalVisits - 1), await member.save();
        const _newActivity = {
          newUser: false,
          activityType: ACTIVITY_TYPE.REVISIT,
          activityDate: new Date(),
          member: member._id,
        };
        const _activity = new Activity(_newActivity);
        await _activity.save();
        return member;
      } else {
        const _newMember = {
          customerName: "TEMP_USER",
          totalVisits: 1,
          lastVisit: new Date(),
          phoneNumber: phone,
        };
        const _member = new Member(_newMember);
        await _member.save();
        const _newActivity = {
          newUser: true,
          activityType: ACTIVITY_TYPE.SIGNUP,
          activityDate: new Date(),
          member: _member._id,
        };
        const _activity = new Activity(_newActivity);
        await _activity.save();
        return _member;
      }
    } else {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ message: "OTP not verified" });
    }
  }
};
