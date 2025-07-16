import { Request, Response } from "express";
import HttpStatusCodes from "../constants/https-status-codes";
import { ActivityService } from "../services";
import { Activity } from "../models";
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

// Messages
const Message = {
  successSignup: "Promotion added successfully.",
  successVerified: "Verified success",
  success: "Success",
  error: "An error occurred",
  NotFound: "User not found",
} as const;

interface IReqPagination {
  query: {
    page: number;
  limit: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  activityType?: string;
  };
}

export const getAllActivities = async (req: IReqPagination, res: Response) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const search = req.query.search;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const activityType = req.query.activityType;

  // List members in pagination
  const list = await ActivityService.getAllActivities({ page, limit, search, startDate, endDate, activityType });

  return res.status(HttpStatusCodes.OK).json(list);
};

export const exportActivity = async (req: Request, res: Response) => {
  try {
    const activities = await Activity.find()
      .populate('member')
      .lean();

    if (!activities.length) {
      return res.status(404).json({ message: 'No activities found' });
    }

    // Format the activities into flat objects
    const formatted = activities.map((activity, index) => ({
      Index: index + 1,
      'Member Name': (typeof activity.member === 'object' && 'customerName' in activity.member)
        ? (activity.member as { customerName?: string }).customerName || 'N/A'
        : 'N/A',
      'New User': activity.newUser ? 'Yes' : 'No',
      'Activity Type': activity.activityType,
      'Activity Date': new Date(activity.activityDate).toISOString().split('T')[0],
      'Activity Points': activity.activityPoints,
      'Activity CreatedAt':new Date(activity.createdAt).toISOString().split('T')[0],
    }));

    const parser = new Parser();
    const csv = parser.parse(formatted);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ActivityReport-${Date.now()}.csv`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    res.send(csv);
  } catch (error) {
    console.error('Error exporting activity CSV:', error);
    res.status(500).json({ message: 'Failed to export CSV' });
  }
}

