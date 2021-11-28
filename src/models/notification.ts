import mongoose, { Schema } from "mongoose";

import Notification from "../types/notification";
import creatorSchema from "../models/schemas/creator";

const schema = new Schema<Notification>({
  creators: [creatorSchema],
  subscriber: {
    id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  type: { type: String, trim: true, maxLength: 100, required: true },
  date: { type: Date, default: Date.now },
  phrase: { type: String, trim: true, maxLength: 100, required: true },
  payload: { type: String, trim: true, maxLength: 100 },
});

export default mongoose.model("Notification", schema);
