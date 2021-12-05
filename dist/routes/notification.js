"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_1 = require("../controllers/notification");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.default)();
router.get("/", auth_1.default, notification_1.getNotifications);
router.put("/:notificationId", auth_1.default, notification_1.markAsSeen);
router.delete("/:notificationId", auth_1.default, notification_1.deleteNotification);
exports.default = router;
