import _, { escapeRegExp } from "lodash";
import { IReward, Reward } from "../models";


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


export const addReward = async (body: IReward) => {
  const newReward = new Reward({
    ...body,
  });

  await newReward.save();
  return newReward;
};

export const getAllRewards = async (params: paginationParams) => {
  const { page, limit } = params;

  let searchQuery = {};
  const paginateOptions = {
    page,
    limit,
    sort: { createdAt: -1 },
    // select: "-lifetimePoints -totalVisits",
  };

  // @ts-ignore
  const _doc = await Reward.paginate(searchQuery, paginateOptions);

  return _doc;
};

export const updateReward = async (
  rewardId: string,
  payload: Partial<IReward>
) => {
  const reward = await Reward.findByIdAndUpdate(
    rewardId,
    { $set: payload },
    { new: true } // Return the updated document
  );

  if (!reward) {
    throw new Error("Reward not found");
  }

  return reward;
};

export const deleteReward = async (rewardId: string) => {
  const reward = await Reward.findByIdAndDelete(rewardId);

  if (!reward) {
    throw new Error("Reward not found");
  }

};
