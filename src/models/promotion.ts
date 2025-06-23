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

export interface IPromotion {
  _id: Types.ObjectId;
  status: string; // e.g., "sent", "draft"
  description: string;
  message: string;
  validity: {
    startDate: NativeDate;
    endDate: NativeDate;
  };
  sendInstant: boolean;
  sendDateTime: NativeDate;
  audience: IAudienceMember[];
  createdBy?: Types.ObjectId; // Reference to User
  // delivered to how many members
  deliveredTo?: number;
  // delivered to how many members via text
  deliveredViaText?: number;
  // how many members replyed YES via text
  claimViaText?: number;
  // how many members redeemed the promotion via text
  redemptionViaText?: number;
  // sum of claimViaText and redemptionViaText
  visits?: number;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

// If you plan to add instance methods later, define them here

type PromotionModel = Model<IPromotion, {}>;

// ----------------------------------------

const promotionSchema = new Schema<IPromotion, PromotionModel>(
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
    sendInstant: {
      type: Boolean,
    },
    validity: {
      startDate: Date,
      endDate: Date,
    },
    sendDateTime: {
      type: Date,
      default: Date.now,
    },
    audience: {
      type: [
        {
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
      ],
    },
    deliveredTo: {
      type: Number,
      default: 0,
    },
    visits: {
      type: Number,
      default: 0,
    },
    deliveredViaText: {
      type: Number,
      default: 0,
    },
    claimViaText: {
      type: Number,
      default: 0,
    },
    redemptionViaText: {
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
promotionSchema.set("toJSON", {
  virtuals: true, // keep virtuals
  versionKey: false,
  transform: function (doc, ret) {
    delete ret.id; // Remove the virtual 'id'
    delete ret.password; // Optional
    return ret;
  },
});

// Plugins
promotionSchema.plugin(mongoosePaginate);

// Model
export const Promotion = model<IPromotion, PromotionModel>(
  "Promotion",
  promotionSchema
);
