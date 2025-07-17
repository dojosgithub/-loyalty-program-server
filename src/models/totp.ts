import { Schema, model, Types, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

// ----------------------------------------

export interface ITOTP {
  _id: Types.ObjectId;
  token?: string; // e.g., "sent", "draft"
  phoneNumber?: string;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

// If you plan to add instance methods later, define them here

type totpSchema = Model<ITOTP, {}>;

// ----------------------------------------

const totpSchema = new Schema<ITOTP, totpSchema>(
  {
    token: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
 
  },
  { versionKey: false, timestamps: true }
);

// Optional: remove sensitive fields when converting to JSON
totpSchema.set("toJSON", {
  virtuals: true, // keep virtuals
  versionKey: false,
  transform: function (doc, ret) {
    delete ret.id; // Remove the virtual 'id'
    delete ret.password; // Optional
    return ret;
  },
});

// Plugins
totpSchema.plugin(aggregatePaginate);

// Model
export const TOTP = model<ITOTP, totpSchema>(
  "TOTP",
  totpSchema
);
