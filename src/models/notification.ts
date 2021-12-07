import mongoose, { Schema } from "mongoose";

import Notification from "../types/notification";
import creatorSchema from "../models/schemas/creator";
import ownerSchema from '../models/schemas/owner';

const schema = new Schema<Notification>({
  creators: {type: [creatorSchema], required: true},
  subscriber: {
    id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  owner: ownerSchema,
  type: { type: String, trim: true, maxLength: 100, required: true },
  date: { type: Date, default: Date.now },
  phrase: { type: String, trim: true, maxLength: 100, required: true },
  payload: { type: String, trim: true, maxLength: 100 },
  seen: { type: Boolean, default: false },
  image: {
    thumbnail: {
      url: { type: String, trim: true },
      dUrl: { type: String, trim: true },
    },
  },
});

export default mongoose.model("Notification", schema);
