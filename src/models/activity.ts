import { Schema, model, Types, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { USER_ROLE } from "../constants/misc";
import { IUser } from "./user";

// ----------------------------------------
export interface IActivity {
  _id: Types.ObjectId;
  member?: Types.ObjectId;
  newUser?: boolean;
  activityType: string; // e.g., "visit", "redemption", "claim"
  activityDate: NativeDate;
  activityPoints?: number; // e.g., "visit", "redemption", "claim"
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

// If you plan to add instance methods later, define them here

type ActivityModel = Model<IActivity, {}>;

// ----------------------------------------

const activitySchema = new Schema<IActivity, ActivityModel>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    newUser: {
      type: Boolean,
    },
    activityType: {
      type: String,
    },
    activityDate: {
      type: Date,
      default: Date.now,
    },
    activityPoints: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false, timestamps: true }
);

// Optional: remove sensitive fields when converting to JSON
activitySchema.set("toJSON", {
  virtuals: true, // keep virtuals
  versionKey: false,
  transform: function (doc, ret) {
    delete ret.id; // Remove the virtual 'id'
    delete ret.password; // Optional
    return ret;
  },
});

// Plugins
activitySchema.plugin(mongoosePaginate);

// Model
export const Activity = model<IActivity, ActivityModel>(
  "Activity",
  activitySchema
);
