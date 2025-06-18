import { Schema, model, Types, Model, Number } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// ----------------------------------------

export interface IMember {
  _id: Types.ObjectId;
  customerName: string;
  phoneNumber: string;
  currentPoints: number;
  lastVisit: NativeDate;
  lifetimePoints: number;
  totalVisits: number;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

// If you plan to add instance methods later, define them here

type MemberModel = Model<IMember, {}>;

// ----------------------------------------

const memberSchema = new Schema<IMember, MemberModel>(
  {
    customerName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    currentPoints: {
      type: Number,
    },
    lastVisit: {
      type: Date,
      default: Date.now,
    },
    lifetimePoints: {
      type: Number,
    },
    totalVisits: {
      type: Number,
    },
  },
  { versionKey: false, timestamps: true }
);

// Optional: remove sensitive fields when converting to JSON
memberSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password;
  },
});

// Plugins
memberSchema.plugin(mongoosePaginate);

// Model
export const Member = model<IMember, MemberModel>("Member", memberSchema);
