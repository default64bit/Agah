import { Router } from "express";
import adminAuth from "./adminAuth";
import adminPanel from "./adminPanel";
import userAuth from "./userAuth";
import web from "./web";
import analytics from "./analytics";

const router = Router();

router.use("/admin/auth", adminAuth);
router.use("/admin", adminPanel);

router.use("/web/auth", userAuth);
router.use("/web", web);

router.use("/analytics", analytics);

export default router;
