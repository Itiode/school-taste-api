"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = void 0;
const user_1 = __importDefault(require("../models/user"));
const notification_1 = __importDefault(require("../models/notification"));
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
                type: n.type,
                phrase: n.phrase,
                payload: n.payload,
                date: n.date,
                seen: n.seen,
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
