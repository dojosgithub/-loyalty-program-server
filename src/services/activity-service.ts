import _, { isElement } from "lodash";
import { Activity } from "../models";
import {
  ActivityQuery,
  IActivityDashboard,
  RecentActivityQuery,
} from "../controllers/activity-controller";
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

export const getAllActivities = async (query: ActivityQuery) => {
  const { page, limit, startDate, endDate, activityType, search } = query;

  const matchStage: any = {};

  // Filter by date range
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    if (
      start &&
      end &&
      start.toISOString().split("T")[0] === end.toISOString().split("T")[0]
    ) {
      // If same date, match whole day
      const dayStart = new Date(start.setHours(0, 0, 0, 0));
      const dayEnd = new Date(end.setHours(23, 59, 59, 999));
      matchStage.activityDate = { $gte: dayStart, $lte: dayEnd };
    } else {
      matchStage.activityDate = {};
      if (start)
        matchStage.activityDate.$gte = new Date(start.setHours(0, 0, 0, 0));
      if (end)
        matchStage.activityDate.$lte = new Date(end.setHours(23, 59, 59, 999));
    }
  }

  // Filter by activityType
  if (activityType) {
    matchStage.activityType = activityType;
  }

  // Build aggregate pipeline
  const aggregate = Activity.aggregate()
    .match(matchStage)
    .lookup({
      from: "members", // your members collection name (lowercase + plural)
      localField: "member",
      foreignField: "_id",
      as: "member",
    })
    .unwind({
      path: "$member",
      preserveNullAndEmptyArrays: true,
    })
    .project({
      activityDate: 1,
      activityType: 1,
      activityPoints: 1,
      createdAt: 1,
      newUser: 1,
      // only include specific member fields
      member: {
        customerName: 1,
        phoneNumber: 1,
      },
    });

  // Search by customerName or phoneNumber
  if (search) {
    const searchRegex = new RegExp(search, "i");
    aggregate.match({
      $or: [
        { "member.customerName": { $regex: searchRegex } },
        { "member.phoneNumber": { $regex: searchRegex } },
      ],
    });
  }

  const options = {
    page: parseInt(String(page)),
    limit: parseInt(String(limit)),
  };

  const result = await (Activity as any).aggregatePaginate(aggregate, options);
  return result;
};

export const getAllActiviyPoints = async () => {
  const pointEarned = await Activity.find({
    activityType: ACTIVITY_TYPE.EARNED,
  });
  const pointRedeemed = await Activity.find({
    activityType: ACTIVITY_TYPE.REDEEM,
  });
  if (isElement(pointEarned) && isElement(pointRedeemed)) {
    return { pointEarned: 0, pointRedeemed: 0 };
  }
  let totalPointsEarned = 0;
  pointEarned.map((activity) => {
    totalPointsEarned += activity.activityPoints || 0;
  });

  let totalPointsRedeemed = 0;
  pointRedeemed.map((activity) => {
    totalPointsRedeemed += activity.activityPoints || 0;
  });
  return { pointEarned: totalPointsEarned, pointRedeemed: totalPointsRedeemed };
};

export const getAllActiviyDashboard = async (body: IActivityDashboard) => {
  const { reportType, startDate, endDate } = body;
  let matchDate: { $gte?: Date; $lte?: Date } = {};
  const start = new Date(startDate as string);
  const end = endDate ? new Date(endDate) : undefined;

  switch (reportType) {
    case "Daily": {
      const dayStart = new Date(start.setHours(0, 0, 0, 0));
      const dayEnd = new Date(start.setHours(23, 59, 59, 999));
      matchDate = { $gte: dayStart, $lte: dayEnd };
      break;
    }

    case "Weekly": {
      const weekStart = new Date(start.setHours(0, 0, 0, 0));
      const weekEnd = end && new Date(end.setHours(23, 59, 59, 999));
      matchDate = { $gte: weekStart, $lte: weekEnd };
      break;
    }

    case "Monthly": {
      const monthStart = new Date(
        start.getFullYear(),
        start.getMonth(),
        1,
        0,
        0,
        0,
        0
      );
      const monthEnd = new Date(
        start.getFullYear(),
        start.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      matchDate = { $gte: monthStart, $lte: monthEnd };
      break;
    }
  }

const pipeline = [
  {
    $match: {
      activityDate: matchDate,
    },
  },
  {
    $project: {
      activityType: 1,
      rawDate: {
        $dateFromParts: {
          year: { $year: "$activityDate" },
          month: { $month: "$activityDate" },
          day: { $dayOfMonth: "$activityDate" }
        }
      }
    }
  },
  {
    $group: {
      _id: "$rawDate",
      newSignUp: {
        $sum: {
          $cond: [{ $eq: ["$activityType", "New Signup"] }, 1, 0],
        },
      },
      revisit: {
        $sum: {
          $cond: [{ $eq: ["$activityType", "Revisit"] }, 1, 0],
        },
      },
    },
  },
  {
    $sort: {
      _id:  1 as 1, // Now sorting by actual Date object
    },
  },
  {
    $project: {
      _id: 0,
      date: {
        $dateToString: { format: "%Y-%m-%d", date: "$_id" }
      },
      newSignUp: 1,
      revisit: 1,
    },
  },
];

const activities = await Activity.aggregate(pipeline)

 const newSignUps = await Activity.find({
    activityType: ACTIVITY_TYPE.SIGNUP,
  });
  const revisits = await Activity.find({
    activityType: ACTIVITY_TYPE.REVISIT,
  });
   
  return {chartData:activities, total :{revisits: revisits.length, newSignUps: newSignUps.length}};
};

export const getAllRecentActivities = async (query: RecentActivityQuery) => {
  const { page, limit, activityType } = query;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const matchStage: any = {
    createdAt: { $gte: sevenDaysAgo },
  };

  if (activityType) {
    matchStage.activityType = activityType;
  }

  const aggregate = Activity.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          activityType: "$activityType",
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.date": -1, // Descending by date
        "_id.activityType": 1,
      },
    },
    {
      $project: {
        date: "$_id.date",
        activityType: "$_id.activityType",
        count: 1,
        _id: 0,
      },
    },
  ]);

  const options = {
    page,
    limit,
  };

  // @ts-ignore
  const _doc = await Activity.aggregatePaginate(aggregate, options);

  return _doc;
};