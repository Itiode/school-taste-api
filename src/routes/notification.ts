import Router from "express";

import { getNotifications } from "../controllers/notification";
import auth from "../middleware/auth";

const router = Router();

router.get("/", auth, getNotifications);

export default router;
