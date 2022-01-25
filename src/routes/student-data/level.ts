import Router from "express";

const router = Router();

import * as lC from "../../controllers/student-data/level";
import auth from "../../middleware/auth";

router.get("/", lC.getLevels);

export default router;
