"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAsSeen = exports.getNotifications = void 0;
const user_1 = __importDefault(require("../models/user"));
const notification_1 = __importDefault(require("../models/notification"));
const functions_1 = require("../shared/utils/functions");
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
        let notifImage = { thumbnail: { url: "", dUrl: "" } };
        const transformedNotifs = [];
        let tempUsers = [];
        for (let n of notifs) {
            if (n.creators.length === 1) {
                const tempUser = tempUsers.find((tU) => tU.id === n.creator.id);
                let image;
                if (tempUser) {
                    image = tempUser.image;
                }
                else {
                    console.log(n.creators[0].id);
                    const user = await user_1.default.findById(n.creators[0].id).select("profileImage");
                    console.log(user);
                    image = {
                        thumbnail: {
                            url: user.profileImage.original.url,
                            dUrl: user.profileImage.original.dUrl,
                        },
                    };
                    tempUsers.push({
                        id: user._id,
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
                formattedDate: (0, functions_1.formatDate)(n.date.toString()),
                seen: n.seen,
                image: notifImage,
            });
        }
        res.send({
            msg: "Notifications fetched successfully",
            count: notifs.length,
            data: transformedNotifs,
        });
    }
    catch (e) {
        next(new Error("Error in fetching notifications: " + e));
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
            return res.status(404).send({ msg: "User not found" });
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
