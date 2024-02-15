import mongoose, { schema } from "mongoose";
const subscriberschema = new mongoose.schema(
  {
    subsriber: {
      type: schema.Types.ObjectId,
      ref: user,
    },
    channel: {
      type: schema.Types.ObjectId,
      ref: user,
    },
  },
  { timestamps: true }
);

export const Subscriber = mongoose.model("Subscriber", subscriberschema);
