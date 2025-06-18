import { Schema, model, Types, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { USER_ROLE } from "../constants/misc";

// ----------------------------------------

export interface IPromotion {
  _id: Types.ObjectId;
  description: string;
  message: string;
  validity: string;
  time: number;
  audience: Array<string>;
  createdBy?: string;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

// If you plan to add instance methods later, define them here

type PromotionModel = Model<IPromotion, {}>;

// ----------------------------------------

const promotionSchema = new Schema<IPromotion, PromotionModel>(
  {
    description: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    validity: {
      startDate: Date,
      endDate: Date,
    },
    time: {
      type: Number,
    },
    audience: {
      type: [String],
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
    delete ret.id;        // Remove the virtual 'id'
    delete ret.password;  // Optional
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
