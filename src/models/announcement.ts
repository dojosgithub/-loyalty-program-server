import { Schema, model, Types, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { USER_ROLE } from "../constants/misc";
import { IUser } from "./user";

// ----------------------------------------

interface IAudienceMember {
  _id: Types.ObjectId;
  name: string;
  length: number;
}

export interface IAnnouncement {
  _id: Types.ObjectId;
  status: string; // e.g., "sent", "draft"
  description: string;
  message: string;
  sendInstant: boolean;
  sendDateTime: NativeDate;
  audience: IAudienceMember;
  createdBy?: Types.ObjectId; // Reference to User
  openRate?: string;
  imageUrl?: string;
  uniqueOpens?: number;
  deliveredTo?: number;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

// If you plan to add instance methods later, define them here

type announcementSchema = Model<IAnnouncement, {}>;

// ----------------------------------------

const announcementSchema = new Schema<IAnnouncement, announcementSchema>(
  {
    status: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    openRate: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    sendInstant: {
      type: Boolean,
    },
    sendDateTime: {
      type: Date,
      default: Date.now,
    },
    audience: {
      _id: {
        type: Schema.Types.ObjectId,
      },
      name: {
        type: String,
      },
      length: {
        type: Number,
      },
    },
    deliveredTo: {
      type: Number,
      default: 0,
    },
    uniqueOpens: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { versionKey: false, timestamps: true }
);

// Optional: remove sensitive fields when converting to JSON
announcementSchema.set("toJSON", {
  virtuals: true, // keep virtuals
  versionKey: false,
  transform: function (doc, ret) {
    delete ret.id; // Remove the virtual 'id'
    delete ret.password; // Optional
    return ret;
  },
});

// Plugins
announcementSchema.plugin(mongoosePaginate);

// Model
export const Announcement = model<IAnnouncement, announcementSchema>(
  "Announcement",
  announcementSchema
);
