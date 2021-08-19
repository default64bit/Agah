import { Router } from "express";
import passport from "passport";
import userAuth from "../middlewares/userAuth";

import AuthContoller from "../controllers/auth/UserAuthController";
import AuthValidator from "../validators/user/AuthValidator";

const router = Router();
const auth = new AuthContoller();

router.post("/register", userAuth.ensureGuest, AuthValidator.register, auth.register.bind(auth));
router.post("/login", userAuth.ensureGuest, auth.login.bind(auth));
router.post("/logout", userAuth.ensureAuth, auth.logout.bind(auth));
router.post("/refresh", userAuth.ensureAuth, auth.refresh.bind(auth));

router.get("/google", userAuth.ensureGuest, passport.authenticate("userGoogleLogin", { scope: ["profile", "email"] }));
router.get("/google/callback", auth.googleCallback.bind(auth));

export default router;
