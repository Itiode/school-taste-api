import Router from "express";

const router = Router();

import * as schoolC from "../controllers/school";
import auth from "../middleware/auth";

router.post("/", auth, schoolC.addSchool);
router.get("/", schoolC.getSchools);

export default router;
