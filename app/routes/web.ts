import { Router } from "express";
import multer from "multer";
import userAuth from "../middlewares/userAuth";

import ProfileController from "../controllers/web/ProfileController";
import ProfileValidator from "../validators/user/ProfileValidator";

import NotificationController from "../controllers/web/NotificationController";

import ConsultersController from "../controllers/web/ConsultersController";
import FaqsController from "../controllers/web/FaqsController";
import ArticlesController from "../controllers/web/ArticlesController";

import BookingController from "../controllers/web/BookingController";
import BookingValidator from "../validators/user/BookingValidator";

import BookedSchedulesController from "../controllers/web/BookedSchedulesController";

import ChatController from "../controllers/web/ChatController";
import ChatValidator from "../validators/user/ChatValidator";

const router = Router();
const profileController = new ProfileController();
const notificationController = new NotificationController();
const consultersController = new ConsultersController();
const faqsController = new FaqsController();
const articlesController = new ArticlesController();
const bookingController = new BookingController();
const bookedSchedulesController = new BookedSchedulesController();
const chatController = new ChatController();

const upload = multer({ dest: process.env.TEMP_FILE_UPLOAD });

router.get("/consulters", consultersController.getConsulters.bind(consultersController));
router.get("/consulter/:id/schedule", consultersController.getSchedule.bind(consultersController));

router.get("/random_faqs", faqsController.getRandomFaqs.bind(faqsController));
router.get("/faqs", faqsController.getFaqs.bind(faqsController));

router.get("/random_articles", articlesController.getRandomArticles.bind(articlesController));
router.get("/articles", articlesController.getArticles.bind(articlesController));
router.get("/article", articlesController.getArticle.bind(articlesController));
router.get("/article/meta", articlesController.getArticleMeta.bind(articlesController));

router.get("/book/callback", bookingController.bookConsultationSessionCallback.bind(bookingController));

// auth middleware =============
router.use(userAuth.ensureAuth);

router.post("/book", BookingValidator.book, bookingController.bookConsultationSession.bind(bookingController));

router.get("/booked_schedules", bookedSchedulesController.getBookedSchedules.bind(bookedSchedulesController));

router.get("/info", profileController.getInfo.bind(profileController));
router.put("/info", ProfileValidator.updateInfo, profileController.updateInfo.bind(profileController));
router.post("/update_avatar", upload.single("avatar"), profileController.updateAvatar.bind(profileController));
router.delete("/profile_avatar", profileController.deleteAvatar.bind(profileController));

router.get("/notifications", notificationController.getNotifs);
router.post("/notifications/read", notificationController.readNotifs);
router.delete("/notification/:id", notificationController.clearNotifs);
router.get("/notif_count", notificationController.getNotifCounts);

router.get("/chats", chatController.getChats.bind(chatController));
router.get("/chat/:id/messages", chatController.getChatMessages.bind(chatController));
router.post(
    "/chat/:id/upload",
    multer({ dest: process.env.TEMP_FILE_UPLOAD }).fields([{ name: "files", maxCount: parseInt(process.env.CHAT_MAX_UPLOAD_COUNT) }]),
    ChatValidator.uploadAttachment,
    chatController.uploadAttachment.bind(chatController)
);

export default router;
