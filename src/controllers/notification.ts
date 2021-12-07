import { RequestHandler } from "express";

import Notification, {
  GetNotificationsRes,
  GetNotificationsQuery,
  NotificationRes,
  UpdateNotificationParams,
} from "../types/notification";
import UserModel from "../models/user";
import NotificationModel from "../models/notification";
import { formatDate } from "../shared/utils/date-format";
import { SimpleRes } from "../types/shared";

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

    const notifs = await NotificationModel.find({
      "subscriber.id": userId,
    })
      // .skip((pageNumber - 1) * pageSize)
      // .limit(pageSize)
      .select("-__v")
      .sort({ _id: -1 });

    const transformedNotifs: NotificationRes[] = notifs.map(
      (n: Notification) => {
        return {
          id: n._id,
          creators: n.creators,
          subscriber: n.subscriber,
          owners: n.owners,
          type: n.type,
          phrase: n.phrase,
          payload: n.payload,
          date: n.date,
          formattedDate: formatDate(n.date.toString()),
          seen: n.seen,
          image: n.image,
        };
      }
    );

    res.send({
      msg: "Notifications fetched successfully",
      count: notifs.length,
      data: transformedNotifs,
    });
  } catch (e) {
    next(new Error("Error in adding sub comment: " + e));
  }
};

export const markAsSeen: RequestHandler<UpdateNotificationParams, SimpleRes> = async (
  req,
  res,
  next
) => {
  try {
    const userId = req["user"].id;
    const user = await UserModel.findById(userId).select("_id");
    if (!user)
      return res.status(404).send({ msg: "No user with the given ID" });

    await NotificationModel.updateOne({
      _id: req.params.notificationId,
      "subscriber.id": userId,
    }, {seen: true});

    res.send({ msg: "Notification marked as seen successfully" });
  } catch (e) {
    next(new Error("Error in marking notification as seen: " + e));
  }
};

export const deleteNotification: RequestHandler<UpdateNotificationParams, SimpleRes> = async (
  req,
  res,
  next
) => {
  try {
    const userId = req["user"].id;
    const user = await UserModel.findById(userId).select("_id");
    if (!user)
      return res.status(404).send({ msg: "No user with the given ID" });

    await NotificationModel.deleteOne({
      _id: req.params.notificationId,
      "subscriber.id": userId,
    });

    res.send({ msg: "Notification deleted successfully" });
  } catch (e) {
    next(new Error("Error in deleting notification: " + e));
  }
};
