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

import LicenceKeysController from "../controllers/admin/LicenceKeysController";
import LicenceKeysValidator from "../validators/admin/LicenceKeysValidator";

import UsersController from "../controllers/admin/UsersController";
import UsersValidator from "../validators/admin/UsersValidator";

import UserRolesController from "../controllers/admin/UserRolesController";
import UserRolesValidator from "../validators/admin/UserRolesValidator";

import OrganizationsController from "../controllers/admin/OrganizationsController";
import OrganizationsValidator from "../validators/admin/OrganizationsValidator";

import PermissionController from "../controllers/admin/PermissionController";

import PanelSettingsController from "../controllers/admin/PanelSettingsController";
import PanelSettingsValidator from "../validators/admin/PanelSettingsValidator";

const router = Router();
const profileController = new ProfileController();
const notificationController = new NotificationController();
const messageBoardController = new MessageBoardController();
const adminsController = new AdminsController();
const adminRolesController = new AdminRolesController();
const licenceKeysController = new LicenceKeysController();
const usersController = new UsersController();
const userRolesController = new UserRolesController();
const organizationsController = new OrganizationsController();
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

router.get("/licence_keys", LicenceKeysValidator.getKeys, licenceKeysController.getKeys.bind(licenceKeysController));
router.get("/licence_key/:id", LicenceKeysValidator.getKey, licenceKeysController.getKey.bind(licenceKeysController));
router.post("/licence_keys", LicenceKeysValidator.addKey, licenceKeysController.addKey.bind(licenceKeysController));
router.put("/licence_keys", LicenceKeysValidator.editKey, licenceKeysController.editKey.bind(licenceKeysController));
router.delete("/licence_key/:id", LicenceKeysValidator.deleteKey, licenceKeysController.deleteKey.bind(licenceKeysController));

router.get("/users", UsersValidator.getUsers, usersController.getUsers.bind(usersController));
router.get("/users/:id", UsersValidator.getUser, usersController.getUser.bind(usersController));
router.post("/users", multer({ dest: process.env.TEMP_FILE_UPLOAD }).single("avatar"), UsersValidator.addUser, usersController.addUser.bind(usersController));
router.put("/users", multer({ dest: process.env.TEMP_FILE_UPLOAD }).single("avatar"), UsersValidator.editUser, usersController.editUser.bind(usersController));
router.delete("/users/:id", UsersValidator.deleteUser, usersController.deleteUser.bind(usersController));

router.get("/user_roles", UserRolesValidator.getRoles, userRolesController.getRoles.bind(userRolesController));
router.get("/user_role/:id", UserRolesValidator.getRole, userRolesController.getRole.bind(userRolesController));
router.post("/user_roles", UserRolesValidator.addRole, userRolesController.addRole.bind(userRolesController));
router.put("/user_roles", UserRolesValidator.editRole, userRolesController.editRole.bind(userRolesController));
router.delete("/user_role/:id", UserRolesValidator.deleteRole, userRolesController.deleteRole.bind(userRolesController));

router.get("/organizations", OrganizationsValidator.getOrganizations, organizationsController.getOrganizations.bind(organizationsController));
router.get("/organization/:id", OrganizationsValidator.getOrganization, organizationsController.getOrganization.bind(organizationsController));
router.post("/organizations", OrganizationsValidator.addOrganization, organizationsController.addOrganization.bind(organizationsController));
router.put("/organizations", OrganizationsValidator.editOrganization, organizationsController.editOrganization.bind(organizationsController));
router.delete("/organization/:id", OrganizationsValidator.deleteOrganization, organizationsController.deleteOrganization.bind(organizationsController));

router.get("/panel_settings", panelSettingsController.getSettings.bind(panelSettingsController));
router.post("/panel_settings", PanelSettingsValidator.editAdmin, panelSettingsController.updateSettings.bind(panelSettingsController));

export default router;
