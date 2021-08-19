import { Request, Response } from "express";
import passport from "passport";
import Admin from "../models/Admin";
import AuthenticatedRequest from "../interfaces/AuthenticatedRequest";

export default {
    ensureAuth(req: AuthenticatedRequest, res: Response, next) {
        passport.authenticate("adminAuthCheck", async (err, admin_id) => {
            if (err) {
                res.status(500).json({ error: err });
            }

            if (admin_id) {
                req.admin = await Admin.model
                    .findById(admin_id)
                    .populate({ path: "role", populate: { path: "permissions", select: "name" } })
                    .exec();

                next();
            } else {
                res.status(401).json({ error: "unauthorized" });
            }
        })(req, res, next);
    },
    ensureGuest(req: Request, res: Response, next) {
        passport.authenticate("adminAuthCheck", (err, admin_id) => {
            if (err) {
                res.status(500).json({ error: err });
            }

            if (!admin_id) {
                next();
            } else {
                res.status(403).json({ error: "you are already logged in as admin" });
            }
        })(req, res, next);
    },
};
