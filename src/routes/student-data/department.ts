import Router from "express";

const router = Router();

import * as dC from "../../controllers/student-data/department";
import auth from "../../middleware/auth";

router.post("/", dC.addDepartment);
router.get("/", dC.getDepartments);

export default router;
