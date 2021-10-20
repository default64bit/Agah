import { Request, Response } from "express";
import passport from "passport";
import User from "../models/User";
import AuthenticatedRequest from "../interfaces/AuthenticatedRequest";

export default {
    ensureAuth(req: AuthenticatedRequest, res: Response, next) {
        passport.authenticate("userAuthCheck", async (err, user_id) => {
            if (err) return res.status(500).json({ error: err });

            if (user_id) {
                req.user = await User.model.findById(user_id).exec();
                next();
            } else return res.status(401).json({ error: "unauthorized" });
        })(req, res, next);
    },
    ensureGuest(req: Request, res: Response, next) {
        passport.authenticate("userAuthCheck", (err, user_id) => {
            if (err) return res.status(500).json({ error: err });

            if (!user_id) next();
            else return res.status(403).json({ error: "you are already logged in" });
        })(req, res, next);
    },
};
