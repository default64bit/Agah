import { Router } from "express";
import multer from "multer";
import adminAuth from "../middlewares/adminAuth";

import ProfileController from "../controllers/admin/ProfileController";
import ProfileValidator from "../validators/admin/ProfileValidator";

import NotificationController from "../controllers/admin/NotificationController";

import MessageBoardController from "../controllers/admin/MessageBoardController";

import AdminsController from "../controllers/admin/AdminsController";
import AdminsValidator from "../validators/admin/AdminsValidator";

import SchedulesController from "../controllers/admin/SchedulesController";
import SchedulesValidator from "../validators/admin/SchedulesValidator";

import TimeOffSchedulesController from "../controllers/admin/TimeOffSchedulesController";
import TimeOffSchedulesValidator from "../validators/admin/TimeOffSchedulesValidator";

import AdminRolesController from "../controllers/admin/AdminRolesController";
import AdminRolesValidator from "../validators/admin/AdminRolesValidator";

import PermissionController from "../controllers/admin/PermissionController";

import UserController from "../controllers/admin/UserController";
import UserValidator from "../validators/admin/UserValidator";

import CallsController from "../controllers/admin/CallsController";
import CallsValidator from "../validators/admin/CallsValidator";

import ArticlesController from "../controllers/admin/ArticlesController";
import ArticlesValidator from "../validators/admin/ArticlesValidator";

import PanelSettingsController from "../controllers/admin/PanelSettingsController";
import PanelSettingsValidator from "../validators/admin/PanelSettingsValidator";

const router = Router();
const profileController = new ProfileController();
const notificationController = new NotificationController();
const messageBoardController = new MessageBoardController();
const adminsController = new AdminsController();
const schedulesController = new SchedulesController();
const timeOffSchedulesController = new TimeOffSchedulesController();
const adminRolesController = new AdminRolesController();
const permissionController = new PermissionController();
const userController = new UserController();
const callsController = new CallsController();
const articlesController = new ArticlesController();
const panelSettingsController = new PanelSettingsController();

router.use(adminAuth.ensureAuth);

router.get("/info", profileController.getInfo.bind(profileController));
router.put("/info", ProfileValidator.updateInfo, profileController.updateInfo.bind(profileController));
router.post("/update_avatar", multer({ dest: process.env.TEMP_FILE_UPLOAD }).single("avatar"), profileController.updateAvatar.bind(profileController));
router.delete("/profile_avatar", profileController.deleteAvatar.bind(profileController));
router.post("/change_password", ProfileValidator.changePassword, profileController.changePassword.bind(profileController));

router.get("/notifications", notificationController.getNotifs);
router.post("/notifications/read", notificationController.readNotifs);
router.delete("/notifications", notificationController.clearNotifs);

router.get("/message_board/chats", messageBoardController.getChats);
router.get("/message_board/messages", messageBoardController.getMessages);
router.get("/message_board/peoples", messageBoardController.getPeoples);

router.get("/admins", AdminsValidator.getAdmins, adminsController.getAdmins.bind(adminsController));
router.get("/admins/:id", AdminsValidator.getAdmin, adminsController.getAdmin.bind(adminsController));
router.post("/admins", multer({ dest: process.env.TEMP_FILE_UPLOAD }).single("avatar"), AdminsValidator.addAdmin, adminsController.addAdmin);
router.put("/admins", multer({ dest: process.env.TEMP_FILE_UPLOAD }).single("avatar"), AdminsValidator.editAdmin, adminsController.editAdmin);
router.delete("/admins/:id", AdminsValidator.deleteAdmin, adminsController.deleteAdmin.bind(adminsController));

router.get("/schedules/:admin_id", SchedulesValidator.getSchedules, schedulesController.getSchedules.bind(schedulesController));
router.post("/schedules", SchedulesValidator.addSchedule, schedulesController.addSchedule.bind(schedulesController));
router.delete("/schedules/:id", SchedulesValidator.deleteSchedule, schedulesController.deleteSchedule.bind(schedulesController));

router.get("/timeoff_schedules/:admin_id", TimeOffSchedulesValidator.getSchedules, timeOffSchedulesController.getSchedules.bind(timeOffSchedulesController));
router.post("/timeoff_schedules", TimeOffSchedulesValidator.addSchedule, timeOffSchedulesController.addSchedule.bind(timeOffSchedulesController));
router.delete("/timeoff_schedules/:id", TimeOffSchedulesValidator.deleteSchedule, timeOffSchedulesController.deleteSchedule.bind(timeOffSchedulesController));

router.get("/admin_roles", AdminRolesValidator.getRoles, adminRolesController.getRoles.bind(adminRolesController));
router.get("/admin_role/:id", AdminRolesValidator.getRole, adminRolesController.getRole.bind(adminRolesController));
router.post("/admin_roles", AdminRolesValidator.addRole, adminRolesController.addRole.bind(adminRolesController));
router.put("/admin_roles", AdminRolesValidator.editRole, adminRolesController.editRole.bind(adminRolesController));
router.delete("/admin_role/:id", AdminRolesValidator.deleteRole, adminRolesController.deleteRole.bind(adminRolesController));
router.get("/permissions", permissionController.getPermissions.bind(permissionController));

router.get("/users", UserValidator.getUsers, userController.getUsers.bind(userController));
router.get("/user/:id/info", UserValidator.getUser, userController.getUserInfo.bind(userController));
router.get("/user/:id/chats", UserValidator.getUser, userController.getUserChats.bind(userController));
router.get("/user/:id/schedules", UserValidator.getUser, userController.getUserSchedules.bind(userController));
router.get("/user/:id/transactions", UserValidator.getUser, userController.getUserTransactions.bind(userController));
router.put("/user/:id", multer({ dest: process.env.TEMP_FILE_UPLOAD }).single("avatar"), UserValidator.editUser, userController.editUser.bind(userController));
router.delete("/user/:id", UserValidator.deleteUser, userController.deleteUser.bind(userController));

router.get("/calls", CallsValidator.getCalls, callsController.getCalls.bind(callsController));

router.get("/articles", ArticlesValidator.getArticles, articlesController.getArticles.bind(articlesController));
router.get("/article/:id", ArticlesValidator.getArticle, articlesController.getArticle.bind(articlesController));
router.post("/articles/:temp/upload_image", multer({ dest: process.env.TEMP_FILE_UPLOAD }).single("image"), articlesController.uploadImage);
router.post("/articles", multer({ dest: process.env.TEMP_FILE_UPLOAD }).single("image"), ArticlesValidator.addArticle, articlesController.addArticle);
router.put("/articles", multer({ dest: process.env.TEMP_FILE_UPLOAD }).single("image"), ArticlesValidator.editArticle, articlesController.editArticle);
router.delete("/article/:id", ArticlesValidator.deleteArticle, articlesController.deleteArticle.bind(articlesController));

router.get("/panel_settings", panelSettingsController.getSettings.bind(panelSettingsController));
router.post("/panel_settings", PanelSettingsValidator.editAdmin, panelSettingsController.updateSettings.bind(panelSettingsController));

export default router;
