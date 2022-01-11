import Router from "express";
import multer from "multer";

import storageConfig from "../shared/utils/s3";
const profileImgUpload = multer({ storage: storageConfig });
const coverImgUpload = multer({ storage: storageConfig });

import * as uC from "../controllers/user";
import auth from "../middleware/auth";

const router = Router();

router.post("/", uC.addUser);
router.get("/me", auth, uC.getUser);
router.get("/:userId", auth, uC.getUser);
router.post("/verify-username", uC.verifyUsername);
router.put(
  "/profile-image/me",
  auth,
  profileImgUpload.single("profile-image"),
  uC.updateProfileImage
);
router.put(
  "/cover-image/me",
  auth,
  coverImgUpload.single("cover-image"),
  uC.updateCoverImage
);
router.get("/profile-images/:filename", auth, uC.getProfileImage);
router.get("/cover-images/:filename", auth, uC.getCoverImage);
router.get("/ruby-balance/me", auth, uC.getRubyBalance);
router.get("/course-mates/me", auth, uC.getCourseMates);
router.put("/about/me", auth, uC.updateAbout);
router.put("/phone/me", auth, uC.updatePhone);
router.put("/faculty/me", auth, uC.updateFaculty);
router.put("/department/me", auth, uC.updateDepartment);
router.put("/level/me", auth, uC.updateLevel);
router.put("/messaging-token/me", auth, uC.updateMessagingToken);
router.put("/payment-details/me", auth, uC.updatePaymentDetails);

export default router;
