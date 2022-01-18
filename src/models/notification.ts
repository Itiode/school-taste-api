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

const NotificationModel = mongoose.model("Notification", schema);

export const shouldCreateNotif = async (
  userId: string,
  notifType: string,
  creatorId: string
) => {
  const notif = await NotificationModel.findOne({
    "creators.id": userId,
    type: notifType,
    "owners.id": creatorId,
  }).select("date");

  if (!notif) return true;

  const aDayInMillis = 86400000;
  const currentTime = new Date().getTime();
  const creationTime = new Date(notif.date).getTime();
  const diff = currentTime - creationTime;
  return diff > aDayInMillis;
};

export default NotificationModel;
