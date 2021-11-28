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
        const notifications = await notification_1.default.find({
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
    }
    catch (e) {
        next(new Error("Error in adding sub comment: " + e));
    }
};
exports.getNotifications = getNotifications;
