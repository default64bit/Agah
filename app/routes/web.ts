import { Router } from "express";
import multer from "multer";
import userAuth from "../middlewares/userAuth";

import ProfileController from "../controllers/web/ProfileController";
import ProfileValidator from "../validators/user/ProfileValidator";

import NotificationController from "../controllers/web/NotificationController";

import ConsultersController from "../controllers/web/ConsultersController";
import FaqsController from "../controllers/web/FaqsController";
import ArticlesController from "../controllers/web/ArticlesController";

const router = Router();
const profileController = new ProfileController();
const notificationController = new NotificationController();
const consultersController = new ConsultersController();
const faqsController = new FaqsController();
const articlesController = new ArticlesController();

const upload = multer({ dest: process.env.TEMP_FILE_UPLOAD });

router.get("/consulters", consultersController.getConsulters.bind(consultersController));
router.get("/random_faqs", faqsController.getRandomFaqs.bind(faqsController));
router.get("/random_articles", articlesController.getRandomArticles.bind(articlesController));

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
