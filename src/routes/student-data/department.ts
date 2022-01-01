import Router from "express";

const router = Router();

import * as dC from "../../controllers/student-data/department";
import auth from "../../middleware/auth";

router.post("/", auth, dC.addDepartment);
router.get("/", auth, dC.getDepartments);

export default router;
