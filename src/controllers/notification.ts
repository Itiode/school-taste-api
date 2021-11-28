import { RequestHandler } from "express";

import {
  GetNotificationsRes,
  GetNotificationsQuery,
} from "../types/notification";
import UserModel from "../models/user";
import NotificationModel from "../models/notification";

export const getNotifications: RequestHandler<
  any,
  GetNotificationsRes,
  any,
  GetNotificationsQuery
> = async (req, res, next) => {
  try {
    const pageNumber = +req.query.pageNumber;
    const pageSize = +req.query.pageSize;

    const userId = req["user"].id;
    const user = await UserModel.findById(userId).select("_id");
    if (!user)
      return res.status(404).send({ msg: "No user with the given ID" });

    const notifications = await NotificationModel.find({
      "subscriber.id": userId,
    })
      // .skip((pageNumber - 1) * pageSize)
      // .limit(pageSize)
      .sort({ _id: -1 });

    res.send({
      msg: "Notifications fetched successfully",
      count: notifications.length,
      data: notifications,
    });
  } catch (e) {
    next(new Error("Error in adding sub comment: " + e));
  }
};
