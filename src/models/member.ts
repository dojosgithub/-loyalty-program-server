import { Schema, model, Types, Model, Number } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// ----------------------------------------

export interface IMember {
  _id: Types.ObjectId;
  customerName: string;
  phoneNumber: string;
  currentPoints: number;
  lastVisit: NativeDate | null;
  lifetimePoints: number;
  totalVisits: number;
  revisitCount: number;
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
      default: 0,
    },
    lastVisit: {
      type: Date,
      default: Date.now,
    },
    lifetimePoints: {
      type: Number,
        default: 0,
    },
    totalVisits: {
      type: Number,
        default: 0,
    },
    revisitCount: {
      type: Number,
        default: 0,
    }
  },
  { versionKey: false, timestamps: true }
);

// Optional: remove sensitive fields when converting to JSON
memberSchema.set("toJSON", {
  virtuals: true, // keep virtuals
  versionKey: false,
  transform: function (doc, ret) {
    delete ret.id;        // Remove the virtual 'id'
    delete ret.password;  // Optional
    return ret;
  },
});

// Plugins
memberSchema.plugin(mongoosePaginate);

// Model
export const Member = model<IMember, MemberModel>("Member", memberSchema);
