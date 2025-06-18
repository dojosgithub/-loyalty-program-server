import { Schema, model, Types } from "mongoose";

// ----------------------------------------

export interface IRefreshToken {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  token: string;
  createdByIp: string;
  revokedByIp?: string;
  replacedByToken?: string;
  expires: NativeDate;
  created: NativeDate;
  revoked?: NativeDate;
  isExpired?: boolean;
  isActive?: boolean;
}

// Schema
const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    token: String,
    expires: Date,
    created: { type: Date, default: Date.now },
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String,
  },
  { versionKey: false, timestamps: true }
);

refreshTokenSchema.virtual("isExpired").get(function () {
  return new Date(Date.now()) >= new Date(this.expires);
});

refreshTokenSchema.virtual("isActive").get(function () {
  return !this.revoked && !this.isExpired;
});

refreshTokenSchema.set("toJSON", {
  virtuals: true, // keep virtuals
  versionKey: false,
  transform: function (doc, ret) {
    delete ret.id;        // Remove the virtual 'id'
    delete ret.password;  // Optional
    return ret;
  },
});

export const RefreshToken = model("RefreshToken", refreshTokenSchema);
