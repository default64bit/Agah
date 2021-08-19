import { Router } from "express";
import multer from "multer";
import userAuth from "../middlewares/userAuth";

import ProfileController from "../controllers/user/ProfileController";
import ProfileValidator from "../validators/user/ProfileValidator";

import InviteController from "../controllers/user/InviteController";
import InviteValidator from "../validators/user/InviteValidator";

import NotificationController from "../controllers/user/NotificationController";

import OrganizationsController from "../controllers/user/OrganizationsController";
import OrganizationsValidator from "../validators/user/OrganizationsValidator";

import RolesController from "../controllers/user/RolesController";
import RolesValidator from "../validators/user/RolesValidator";

import MembersController from "../controllers/user/MembersController";
import MembersValidator from "../validators/user/MembersValidator";

import StoresController from "../controllers/user/StoresController";
import StoresValidator from "../validators/user/StoresValidator";

import PartsController from "../controllers/user/PartsController";
import PartsValidator from "../validators/user/PartsValidator";

import LocationsController from "../controllers/user/LocationsController";
import LocationsValidator from "../validators/user/LocationsValidator";

import LicenceKeysController from "../controllers/user/LicenceKeysController";

import FilesController from "../controllers/user/FilesController";

const router = Router();
const profileController = new ProfileController();
const inviteController = new InviteController();
const notificationController = new NotificationController();
const organizationsController = new OrganizationsController();
const licenceKeysController = new LicenceKeysController();
const rolesController = new RolesController();
const membersController = new MembersController();
const storesController = new StoresController();
const partsController = new PartsController();
const locationsController = new LocationsController();
const filesController = new FilesController();

const upload = multer({ dest: process.env.TEMP_FILE_UPLOAD });

router.use(userAuth.ensureAuth);

router.get("/info", profileController.getInfo.bind(profileController));
router.put("/info", ProfileValidator.updateInfo, profileController.updateInfo.bind(profileController));
router.post("/update_avatar", upload.single("avatar"), profileController.updateAvatar.bind(profileController));
router.delete("/profile_avatar", profileController.deleteAvatar.bind(profileController));
router.post("/change_password", ProfileValidator.changePassword, profileController.changePassword.bind(profileController));
router.get("/permissions", ProfileValidator.getPermissions, profileController.getPermissions.bind(profileController));

router.get("/invites", inviteController.getInvites.bind(inviteController));
router.post("/invite/accept", InviteValidator.acceptInvite, inviteController.acceptInvite.bind(inviteController));
router.post("/invite/reject", InviteValidator.rejectInvite, inviteController.rejectInvite.bind(inviteController));

router.get("/notifications", notificationController.getNotifs);
router.post("/notifications/read", notificationController.readNotifs);
router.delete("/notifications", notificationController.clearNotifs);

router.get("/selectable_organizations", organizationsController.getSelectableOrganizations.bind(organizationsController));
router.get("/organizations", OrganizationsValidator.getOrganizations, organizationsController.getOrganizations.bind(organizationsController));
router.get("/organization/:id", OrganizationsValidator.getOrganization, organizationsController.getOrganization.bind(organizationsController));
router.get(
    "/organization/:id/licence_info",
    OrganizationsValidator.getOrganization,
    organizationsController.getOrganizationLicenceInfo.bind(organizationsController)
);
router.get(
    "/organization/:id/storage_info",
    OrganizationsValidator.getOrganization,
    organizationsController.getOrganizationStorageInfo.bind(organizationsController)
);
router.post("/organizations", OrganizationsValidator.addOrganization, organizationsController.addOrganization.bind(organizationsController));
router.put("/organizations", OrganizationsValidator.editOrganization, organizationsController.editOrganization.bind(organizationsController));
// router.delete("/organization/:id", OrganizationsValidator.deleteOrganization, organizationsController.deleteOrganization.bind(organizationsController));

router.get("/licence_keys", licenceKeysController.getKeys.bind(licenceKeysController));

router.get("/role/permissions", rolesController.getPermissions.bind(rolesController));
router.get("/roles", RolesValidator.getRoles, rolesController.getRoles.bind(rolesController));
router.get("/role/:id", RolesValidator.getRole, rolesController.getRole.bind(rolesController));
router.post("/roles", RolesValidator.addRole, rolesController.addRole.bind(rolesController));
router.put("/roles", RolesValidator.editRole, rolesController.editRole.bind(rolesController));
// router.delete("/roles/:id", RolesValidator.deleteRole, rolesController.deleteRole.bind(rolesController));

router.get("/members/roles", membersController.getRoles.bind(membersController));
router.get("/members", MembersValidator.getMembers, membersController.getMembers.bind(membersController));
router.get("/member/:id", MembersValidator.getMember, membersController.getMember.bind(membersController));
router.post("/members", MembersValidator.addMember, membersController.addMember.bind(membersController));
router.put("/members", MembersValidator.editMember, membersController.editMember.bind(membersController));
router.delete("/members/:id", MembersValidator.deleteMember, membersController.deleteMember.bind(membersController));

router.get("/stores", StoresValidator.getStores, storesController.getStores.bind(storesController));
router.get("/store/:id", StoresValidator.getStore, storesController.getStore.bind(storesController));
router.post("/stores", StoresValidator.addStore, storesController.addStore.bind(storesController));
router.put("/stores", StoresValidator.editStore, storesController.editStore.bind(storesController));
// router.delete("/stores/:id", StoresValidator.deleteStore, storesController.deleteStore.bind(storesController));

router.get("/parts/stores", partsController.getStores.bind(partsController));
router.get("/parts", PartsValidator.getParts, partsController.getParts.bind(partsController));
router.post("/part/:id/restock", PartsValidator.restockPart, partsController.restockPart.bind(partsController));
router.get("/part/:id/stock_history", PartsValidator.getPart, partsController.getPartStockHistory.bind(partsController));
router.get("/part/:id", PartsValidator.getPart, partsController.getPart.bind(partsController));
router.post(
    "/parts",
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "docFiles", maxCount: 10 },
    ]),
    PartsValidator.addPart,
    partsController.addPart.bind(partsController)
);
router.put(
    "/parts",
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "docFiles", maxCount: 10 },
    ]),
    PartsValidator.editPart,
    partsController.editPart.bind(partsController)
);
// router.delete("/parts/:id", PartsValidator.deletePart, partsController.deletePart.bind(partsController));

router.get("/locations", LocationsValidator.getLocations, locationsController.getLocations.bind(locationsController));
router.get("/location/:id", LocationsValidator.getLocation, locationsController.getLocation.bind(locationsController));
router.post("/locations", LocationsValidator.addLocation, locationsController.addLocation.bind(locationsController));
router.put("/locations", LocationsValidator.editLocation, locationsController.editLocation.bind(locationsController));
// router.delete("/locations/:id", LocationsValidator.deleteLocation, locationsController.deleteLocation.bind(locationsController));

router.get("/file/:type/:filename", filesController.getFile.bind(filesController));
router.delete("/file/:type/:filename", filesController.deleteFile.bind(filesController));

export default router;
