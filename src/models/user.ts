import { Schema, model, Types, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { USER_ROLE } from "../constants/misc";

// ----------------------------------------

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  picture?: string;
  phone?: string;
  password: string;
  role: USER_ROLE;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

// If you plan to add instance methods later, define them here
export interface IUserMethods {}

type UserModel = Model<IUser, {}, IUserMethods>;

// ----------------------------------------

const userSchema = new Schema<IUser, UserModel>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    picture: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
        type: String,
        default: USER_ROLE.User,
      },
  },
  { versionKey: false, timestamps: true }
);

// Optional: remove sensitive fields when converting to JSON
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password;
  },
});

// Plugins
userSchema.plugin(mongoosePaginate);

// Model
export const User = model<IUser, UserModel>("User", userSchema);
