import _ from "lodash";
import HttpStatusCodes from "../constants/https-status-codes";
import { IUser, User } from "../models";
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

interface ISignupReq {
  username: string;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phone: string;
}

export const signup = async (reqBody: ISignupReq): Promise<IUser> => {
  const { email, username, password, firstname, lastname, phone } = reqBody;

  // Check user exists
  const user = await User.findOne({ $or: [{ email }, { username }] });
  const userExists: boolean = !_.isEmpty(user);
  if (userExists)
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.EmailAlreadyExists(email)
    );

  // Encrypt password
  const hashPassword: string = await passwordUtil.getHash(password);

  // // Create stripe customer
  // const customerCreateParams: Stripe.CustomerCreateParams = {
  //   email,
  //   name: firstname + " " + lastname,
  //   address: {
  //     city,
  //     postal_code: zip,
  //   },
  // };
  // const { id: stripeCustomer } = await stripe.customers.create(
  //   customerCreateParams
  // );

  // Create user in db
  const _newUser = {
    username,
    email,
    password: hashPassword,
    firstname,
    lastname,
    //   stripeCustomer,
    phone,
  };
  const _user = new User(_newUser);
  await _user.save();

  return _user;
};


/**
 * Login a user.
 */
export const login = async (email: string, password: string) => {
    // Fetch user
    const user = await User.findOne({ email });
  
    if (_.isEmpty(user))
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.InvalidLogin);
  
    // Check password
    const hash = user.password ?? "",
      pwdPassed = await passwordUtil.compare(password, hash);
  
    if (!pwdPassed) {
      // If password failed, wait 500ms this will increase security
      await tick(500);
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.InvalidLogin);
    }
  
    return user;
  };
