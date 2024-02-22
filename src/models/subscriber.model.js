import mongoose, { Schema } from "mongoose";
const subscriberschema = new mongoose.schema(
  {
    subsriber: {
      type: Schema.Types.ObjectId,
      ref: user,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: user,
    },
  },
  { timestamps: true }
);

export const Subscriber = mongoose.model("Subscriber", subscriberschema);
