import mongoose, { Schema } from "mongoose";

import Notification from "../types/notification";
import creatorSchema from "../models/schemas/creator";
import ownerSchema from "../models/schemas/owner";

const schema = new Schema<Notification>({
  creators: { type: [creatorSchema], required: true },
  subscriber: {
    id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  owners: [ownerSchema],
  type: { type: String, trim: true, maxLength: 100, required: true },
  date: { type: Date, default: Date.now },
  phrase: { type: String, trim: true, maxLength: 100, required: true },
  contentId: { type: Schema.Types.ObjectId, required: true },
  payload: { type: String, trim: true, maxLength: 100 },
  seen: { type: Boolean, default: false },
});

export default mongoose.model("Notification", schema);
