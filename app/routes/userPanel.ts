import { Router } from "express";
import multer from "multer";
import userAuth from "../middlewares/userAuth";

import ProfileController from "../controllers/user/ProfileController";
import ProfileValidator from "../validators/user/ProfileValidator";

import NotificationController from "../controllers/user/NotificationController";

const router = Router();
const profileController = new ProfileController();
const notificationController = new NotificationController();

const upload = multer({ dest: process.env.TEMP_FILE_UPLOAD });

router.use(userAuth.ensureAuth);

router.get("/info", profileController.getInfo.bind(profileController));
router.put("/info", ProfileValidator.updateInfo, profileController.updateInfo.bind(profileController));
router.post("/update_avatar", upload.single("avatar"), profileController.updateAvatar.bind(profileController));
router.delete("/profile_avatar", profileController.deleteAvatar.bind(profileController));
router.post("/change_password", ProfileValidator.changePassword, profileController.changePassword.bind(profileController));

router.get("/notifications", notificationController.getNotifs);
router.post("/notifications/read", notificationController.readNotifs);
router.delete("/notifications", notificationController.clearNotifs);

export default router;
