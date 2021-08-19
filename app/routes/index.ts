import { Router } from "express";
import adminAuth from "./adminAuth";
import adminPanel from "./adminPanel";
import userAuth from "./userAuth";
import userPanel from "./userPanel";

import ListItemsController from "../controllers/ListItemsController";
const router = Router();

const listItemsCtl = new ListItemsController();

router.use("/admin/auth", adminAuth);
router.use("/admin", adminPanel);

router.use("/user/auth", userAuth);
router.use("/user", userPanel);

router.get("/language_options", listItemsCtl.get_language_options.bind(listItemsCtl));
router.get("/number_format_options", listItemsCtl.get_number_format_options.bind(listItemsCtl));
router.get("/datetime_format_options", listItemsCtl.get_datetime_format_options.bind(listItemsCtl));
router.get("/timezone_options", listItemsCtl.get_timezone_options.bind(listItemsCtl));
router.get("/cost_units", listItemsCtl.get_cost_units.bind(listItemsCtl));
router.get("/business_types", listItemsCtl.get_business_types.bind(listItemsCtl));

export default router;
