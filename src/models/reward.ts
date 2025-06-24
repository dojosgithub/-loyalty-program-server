import { Schema, model, Types, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// ----------------------------------------

export interface IReward {
  _id: Types.ObjectId;
  reward?: string; // e.g., "sent", "draft"
  pointValue?: number;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

// If you plan to add instance methods later, define them here

type rewardSchema = Model<IReward, {}>;

// ----------------------------------------

const rewardSchema = new Schema<IReward, rewardSchema>(
  {
    reward: {
      type: String,
    },
    pointValue: {
      type: Number,
      default: 0,
    },
 
  },
  { versionKey: false, timestamps: true }
);

// Optional: remove sensitive fields when converting to JSON
rewardSchema.set("toJSON", {
  virtuals: true, // keep virtuals
  versionKey: false,
  transform: function (doc, ret) {
    delete ret.id; // Remove the virtual 'id'
    delete ret.password; // Optional
    return ret;
  },
});

// Plugins
rewardSchema.plugin(mongoosePaginate);

// Model
export const Reward = model<IReward, rewardSchema>(
  "Reward",
  rewardSchema
);
