import Router from "express";

import { getNotifications, markAsSeen, deleteNotification } from "../controllers/notification";
import auth from "../middleware/auth";

const router = Router();

router.get("/", auth, getNotifications);
router.put("/:notificationId", auth, markAsSeen);
router.delete("/:notificationId", auth, deleteNotification);

export default router;
