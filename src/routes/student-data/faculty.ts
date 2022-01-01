import Router from "express";

const router = Router();

import * as fC from "../../controllers/student-data/faculty";
import auth from "../../middleware/auth";

router.post("/", auth, fC.addFaculty);
router.get("/", auth, fC.getFaculties);

export default router;
