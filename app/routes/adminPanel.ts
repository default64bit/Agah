import { Router } from "express";
import multer from "multer";
import adminAuth from "../middlewares/adminAuth";

import ProfileController from "../controllers/admin/ProfileController";
import ProfileValidator from "../validators/admin/ProfileValidator";

import NotificationController from "../controllers/admin/NotificationController";

import MessageBoardController from "../controllers/admin/MessageBoardController";

import AdminsController from "../controllers/admin/AdminsController";
import AdminsValidator from "../validators/admin/AdminsValidator";

import AdminRolesController from "../controllers/admin/AdminRolesController";
import AdminRolesValidator from "../validators/admin/AdminRolesValidator";

import PermissionController from "../controllers/admin/PermissionController";

import PanelSettingsController from "../controllers/admin/PanelSettingsController";
import PanelSettingsValidator from "../validators/admin/PanelSettingsValidator";

const router = Router();
const profileController = new ProfileController();
const notificationController = new NotificationController();
const messageBoardController = new MessageBoardController();
const adminsController = new AdminsController();
const adminRolesController = new AdminRolesController();
const permissionController = new PermissionController();
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

router.get("/admins", AdminsValidator.getAdmins, adminsController.getAdmins.bind(permissionController));
router.get("/admins/:id", AdminsValidator.getAdmin, adminsController.getAdmin.bind(permissionController));
router.post(
    "/admins",
    multer({ dest: process.env.TEMP_FILE_UPLOAD }).single("avatar"),
    AdminsValidator.addAdmin,
    adminsController.addAdmin.bind(permissionController)
);
router.put(
    "/admins",
    multer({ dest: process.env.TEMP_FILE_UPLOAD }).single("avatar"),
    AdminsValidator.editAdmin,
    adminsController.editAdmin.bind(permissionController)
);
router.delete("/admins/:id", AdminsValidator.deleteAdmin, adminsController.deleteAdmin.bind(permissionController));

router.get("/admin_roles", AdminRolesValidator.getRoles, adminRolesController.getRoles.bind(adminRolesController));
router.get("/admin_role/:id", AdminRolesValidator.getRole, adminRolesController.getRole.bind(adminRolesController));
router.post("/admin_roles", AdminRolesValidator.addRole, adminRolesController.addRole.bind(adminRolesController));
router.put("/admin_roles", AdminRolesValidator.editRole, adminRolesController.editRole.bind(adminRolesController));
router.delete("/admin_role/:id", AdminRolesValidator.deleteRole, adminRolesController.deleteRole.bind(adminRolesController));

router.get("/permissions", permissionController.getPermissions.bind(permissionController));

router.get("/panel_settings", panelSettingsController.getSettings.bind(panelSettingsController));
router.post("/panel_settings", PanelSettingsValidator.editAdmin, panelSettingsController.updateSettings.bind(panelSettingsController));

export default router;
