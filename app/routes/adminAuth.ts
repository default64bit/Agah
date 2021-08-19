import { Router } from "express";
import passport from "passport";
import AuthContoller from "../controllers/auth/AdminAuthController";
import adminAuth from "../middlewares/adminAuth";

const router = Router();
const auth = new AuthContoller();

router.post("/login", adminAuth.ensureGuest, auth.login);
router.post("/logout", adminAuth.ensureAuth, auth.logout);
router.post("/refresh", adminAuth.ensureAuth, auth.refresh);

router.get("/google", adminAuth.ensureGuest, passport.authenticate("adminGoogleLogin", { scope: ["profile", "email"] }));
router.get("/google/callback", auth.googleCallback);

export default router;
