import { Request, Response } from "express";
import HttpStatusCodes from "../constants/https-status-codes";
import { ActivityService } from "../services";
import { Activity } from "../models";
import { Parser } from "json2csv";

// Messages
const Message = {
  successSignup: "Promotion added successfully.",
  successVerified: "Verified success",
  success: "Success",
  error: "An error occurred",
  NotFound: "User not found",
} as const;

export interface ActivityQuery {
  page: string | number;
  limit: string | number;
  search?: string;
  startDate?: string;
  endDate?: string;
  activityType?: string;
}

export interface RecentActivityQuery {
  page: string | number;
  limit: string | number;
  activityType?: string;
}

export interface IActivityDashboard {
  reportType?: string;
  startDate?: string;
  endDate?: string;
}


export const getAllActivities = async (
  req: Request<{}, {}, {}, ActivityQuery>,
  res: Response
) => {
  // List Activity in pagination
  const list = await ActivityService.getAllActivities(req.query);

  return res.status(HttpStatusCodes.OK).json(list);
};

export const exportActivity = async (req: Request, res: Response) => {
  try {
    const activities = await Activity.find().populate("member").lean();

    if (!activities.length) {
      return res.status(404).json({ message: "No activities found" });
    }

    // Format the activities into flat objects
    const formatted = activities.map((activity, index) => ({
      Index: index + 1,
      "Member Name":
        typeof activity.member === "object" && "customerName" in activity.member
          ? (activity.member as { customerName?: string }).customerName || "N/A"
          : "N/A",
      "New User": activity.newUser ? "Yes" : "No",
      "Activity Type": activity.activityType,
      "Activity Date (DD/MM/YYYY)": new Date(activity.activityDate)
        .toISOString()
        .split("T")[0],
      "Activity Points": activity.activityPoints,
      "Activity CreatedAt (DD/MM/YYYY)": new Date(activity.createdAt)
        .toISOString()
        .split("T")[0],
    }));

    const parser = new Parser();
    const csv = parser.parse(formatted);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ActivityReport-${Date.now()}.csv`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    res.send(csv);
  } catch (error) {
    console.error("Error exporting activity CSV:", error);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};

export const getAllActiviyPoints = async (req: Request, res: Response) => {
  // List Activity in pagination
  // const list = await ActivityService.getAllActivities(req.query);
  const list = await ActivityService.getAllActiviyPoints();

  return res.status(HttpStatusCodes.OK).json(list);
};


export const getAllActiviyDashboard = async (req: Request, res: Response) => {
  const body = req.body as IActivityDashboard;
  
  const list = await ActivityService.getAllActiviyDashboard(body);

  return res.status(HttpStatusCodes.OK).json(list);
};

export const getAllRecentActiviyDashboard = async (
  req: Request<{}, {}, {}, RecentActivityQuery>,
  res: Response
) => {
  // List Activity in pagination
  const list = await ActivityService.getAllRecentActivities(req.query);

  return res.status(HttpStatusCodes.OK).json(list);
};
