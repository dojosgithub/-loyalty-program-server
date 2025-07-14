import { Twilio } from "twilio";
import _ from "lodash";
import { RouteError } from "../other/classes";
import HttpStatusCodes from "../constants/https-status-codes";
import * as SMSTemplates from "../sms-templates";


const Errors = {
  Unauth: "Unauthorized",
  EmailNotFound(email: string) {
    return `User with email ${email} not found`;
  },
  EmailAlreadyExists(email: string) {
    return `An account with this email already exists`;
  },
  NoEmail: "Please enter a valid email",
  NoAccount: "Account does not exist",
  NotFound: "Document does not exist",
  InvalidOrExpired: "Token is invalid or expired",
  AccountNotVerified:
    "Please confirm your account by confirmation email try again",
  InvalidLogin: "Incorrect email or password",
  InvalidEmailToken: "Invalid token",
  ErrorInDeleting: "An error occurred while deleting",
  ErrorInUpdating: "An error occurred while updating",
  Error: "An error occurred",
  CantCancelReservation: "You cannot cancel a reservation now",
  ParamFalsey: "Param is falsey",
  gameInPast: "You cannot join a game in past",
  alreadyInSomeoneCheckout:
    "Please wait, some people are checking out the game. Try again after some time",
} as const;

const client = new Twilio(process.env.accountSid, process.env.authToken);

export const sendSMS = async (body: string, to: string ) => {
    if (process.env.SEND_SMS && to) {
      await client.messages.create({
        body,
        to,
        messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
      });
      console.log(to)
    }
  };

  /**
 * Create and send promotion on sms
 */
export const sendPromotions = async (
  phoneNumbers: string[],
  params: any
): Promise<void> => {
  if (_.isEmpty(phoneNumbers))
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ParamFalsey);

  const smsTemplate = SMSTemplates.promotions(params);

  for (let index = 0; index < phoneNumbers.length; index++) {
    const phoneNumber = phoneNumbers[index];
    await sendSMS(smsTemplate, phoneNumber);
  }
};

  /**
 * Create and send announcement on sms
 */
export const sendAnnouncements = async (
  phoneNumbers: string[],
  params: any
): Promise<void> => {
  if (_.isEmpty(phoneNumbers))
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ParamFalsey);

  const smsTemplate = SMSTemplates.announcments(params);

  for (let index = 0; index < phoneNumbers.length; index++) {
    const phoneNumber = phoneNumbers[index];
    await sendSMS(smsTemplate, phoneNumber);
  }
};

 /**
 * Create and send OTP on sms
 */
export const sendOtps = async (
  phoneNumber: string,
  params: any
): Promise<void> => {
  if (!phoneNumber)
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ParamFalsey);

  const smsTemplate = SMSTemplates.sendOtp(params);

    await sendSMS(smsTemplate, phoneNumber);
};
  