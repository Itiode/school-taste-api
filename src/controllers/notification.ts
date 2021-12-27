import { RequestHandler } from "express";

import Notification, {
  GetNotificationsRes,
  GetNotificationsQuery,
  NotificationRes,
  UpdateNotificationParams,
  NotificationImage,
} from "../types/notification";
import UserModel from "../models/user";
import NotificationModel from "../models/notification";
import { formatDate } from "../shared/utils/functions";
import { SimpleRes } from "../types/shared";
import { TempUser } from "../types/user";

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

    let notifImage = { thumbnail: { url: "", dUrl: "" } };
    const transformedNotifs: NotificationRes[] = [];

    let tempUsers: {
      id: string;
      image: NotificationImage;
    }[] = [];

    for (let n of notifs) {
      if (n.creators.length === 1) {
        const fetchedUser = tempUsers.find((tU) => tU.id === n.creator.id);
        let image: NotificationImage;

        if (fetchedUser) {
          image = fetchedUser.image;
        } else {
          const creator = await UserModel.findById(n.creators[0].id).select(
            "profileImage"
          );

          image = {
            thumbnail: {
              url: creator.profileImage.original.url,
              dUrl: creator.profileImage.original.dUrl,
            },
          };

          tempUsers.push({
            id: creator._id,
            image,
          });
        }

        notifImage = image;
      }

      transformedNotifs.push({
        id: n._id,
        creators: n.creators,
        owners: n.owners,
        type: n.type,
        phrase: n.phrase,
        payload: n.payload,
        contentId: n.contentId,
        date: n.date,
        formattedDate: formatDate(n.date.toString()),
        seen: n.seen,
        image: notifImage,
      });
    }

    res.send({
      msg: "Notifications fetched successfully",
      count: notifs.length,
      data: transformedNotifs,
    });
  } catch (e) {
    next(new Error("Error in fetching notifications: " + e));
  }
};

export const markAsSeen: RequestHandler<UpdateNotificationParams, SimpleRes> =
  async (req, res, next) => {
    try {
      const userId = req["user"].id;
      const user = await UserModel.findById(userId).select("_id");
      if (!user)
        return res.status(404).send({ msg: "No user with the given ID" });

      await NotificationModel.updateOne(
        {
          _id: req.params.notificationId,
          "subscriber.id": userId,
        },
        { seen: true }
      );

      res.send({ msg: "Notification marked as seen successfully" });
    } catch (e) {
      next(new Error("Error in marking notification as seen: " + e));
    }
  };

export const deleteNotification: RequestHandler<
  UpdateNotificationParams,
  SimpleRes
> = async (req, res, next) => {
  try {
    const userId = req["user"].id;
    const user = await UserModel.findById(userId).select("_id");
    if (!user) return res.status(404).send({ msg: "User not found" });

    await NotificationModel.deleteOne({
      _id: req.params.notificationId,
      "subscriber.id": userId,
    });

    res.send({ msg: "Notification deleted successfully" });
  } catch (e) {
    next(new Error("Error in deleting notification: " + e));
  }
};
