import { Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import NotifSender from "../../Notifications/Sender";

class AuthController {
    public login(req: Request, res: Response, next) {
        passport.authenticate("adminLogin", (err, admin_id) => {
            const { response, AdminAuthError } = AuthController.generateToken(req, res, err, admin_id);
            if (AdminAuthError) return response.status(401).end();

            NotifSender([admin_id], "admins", ["system"], "NewLogin", {
                icon: "fad fa-user-unlock",
                title: "New Login",
                message: `New login from ${req.ip}, with username and password`,
            });
            return response.status(200).end();
        })(req, res, next);
    }

    public async googleCallback(req: Request, res: Response, next) {
        passport.authenticate("adminGoogleLogin", { failureRedirect: "/admin/login" }, (err, admin_id) => {
            const { response, AdminAuthError } = AuthController.generateToken(req, res, err, admin_id);
            response.redirect("/admin");
        })(req, res, next);
    }

    public refresh(req: AuthenticatedRequest, res: Response) {
        let token = jwt.sign(req.admin._id.toHexString(), process.env.JWT_SECRET);
        res.cookie("AdminAuthToken", token, { sameSite: "lax", path: "/", httpOnly: true, secure: true, maxAge: 900000 });
        res.end();
    }

    public logout(req: AuthenticatedRequest, res: Response) {
        req.logout();
        res.clearCookie("AdminAuthToken");
        req.admin = undefined;
        res.status(200).end();
    }

    // ============================================================

    public static generateToken(req: Request, res: Response, err, admin_id) {
        let AdminAuthError = null;

        if (err) {
            AdminAuthError = err;
            res.cookie("AdminAuthError", AdminAuthError, { maxAge: 3000 });
            return { response: res, AdminAuthError };
        }
        if (!admin_id) {
            AdminAuthError = "Invalide Username Or Password";
            res.cookie("AdminAuthError", AdminAuthError, { maxAge: 3000 });
            return { response: res, AdminAuthError };
        }

        let token = "";
        let error = "";
        req.login(admin_id, { session: false }, (err) => {
            if (err) error = err;

            token = jwt.sign(admin_id, process.env.JWT_SECRET);
        });
        if (error) {
            res.cookie("AdminAuthError", error, { maxAge: 3000 });
            console.error(error);
            return { response: res, AdminAuthError: error };
        }

        // set a 15min cookie
        res.cookie("AdminAuthToken", token, { sameSite: "lax", path: "/", httpOnly: true, secure: true, maxAge: 900000 });
        return { response: res, AdminAuthError };
    }
}

export default AuthController;
