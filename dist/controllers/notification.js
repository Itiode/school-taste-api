"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAsSeen = exports.getNotifications = void 0;
const user_1 = __importDefault(require("../models/user"));
const notification_1 = __importDefault(require("../models/notification"));
const date_format_1 = require("../shared/utils/date-format");
const getNotifications = async (req, res, next) => {
    try {
        const pageNumber = +req.query.pageNumber;
        const pageSize = +req.query.pageSize;
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId).select("_id");
        if (!user)
            return res.status(404).send({ msg: "No user with the given ID" });
        const notifs = await notification_1.default.find({
            "subscriber.id": userId,
        })
            // .skip((pageNumber - 1) * pageSize)
            // .limit(pageSize)
            .select("-__v")
            .sort({ _id: -1 });
        const transformedNotifs = notifs.map((n) => {
            return {
                id: n._id,
                creators: n.creators,
                subscriber: n.subscriber,
                owners: n.owners,
                type: n.type,
                phrase: n.phrase,
                payload: n.payload,
                date: n.date,
                formattedDate: (0, date_format_1.formatDate)(n.date.toString()),
                seen: n.seen,
                image: n.image,
            };
        });
        res.send({
            msg: "Notifications fetched successfully",
            count: notifs.length,
            data: transformedNotifs,
        });
    }
    catch (e) {
        next(new Error("Error in adding sub comment: " + e));
    }
};
exports.getNotifications = getNotifications;
const markAsSeen = async (req, res, next) => {
    try {
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId).select("_id");
        if (!user)
            return res.status(404).send({ msg: "No user with the given ID" });
        await notification_1.default.updateOne({
            _id: req.params.notificationId,
            "subscriber.id": userId,
        }, { seen: true });
        res.send({ msg: "Notification marked as seen successfully" });
    }
    catch (e) {
        next(new Error("Error in marking notification as seen: " + e));
    }
};
exports.markAsSeen = markAsSeen;
const deleteNotification = async (req, res, next) => {
    try {
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId).select("_id");
        if (!user)
            return res.status(404).send({ msg: "No user with the given ID" });
        await notification_1.default.deleteOne({
            _id: req.params.notificationId,
            "subscriber.id": userId,
        });
        res.send({ msg: "Notification deleted successfully" });
    }
    catch (e) {
        next(new Error("Error in deleting notification: " + e));
    }
};
exports.deleteNotification = deleteNotification;
