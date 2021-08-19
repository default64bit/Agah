import { Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import NotifSender from "../../Notifications/Sender";
import User from "../../models/User";

class AuthController {
    public async register(req: Request, res: Response, next) {
        // create the user
        const user = await User.model.create({
            name: req.body.name.toString(),
            family: req.body.family.toString(),
            email: req.body.email.toString(),
            password: await User.hash(req.body.password),
        });

        // make auth token and log in the user
        const { response, UserAuthError } = this.generateToken(req, res, null, user.id);
        if (UserAuthError) return response.status(401).end();

        // return response to fornt that redirects user to dashboard
        return response.status(200).end();
    }

    public login(req: Request, res: Response, next) {
        passport.authenticate("userLogin", (err, user_id) => {
            const { response, UserAuthError } = this.generateToken(req, res, err, user_id);
            if (UserAuthError) return response.status(401).end();

            NotifSender(user_id, "users", ["system"], "NewLogin", {
                icon: "fad fa-user-unlock",
                title: "New Login",
                message: `New login from ${req.ip}, with username and password`,
            });
            return response.status(200).end();
        })(req, res, next);
    }

    public async googleCallback(req: Request, res: Response, next) {
        passport.authenticate("userGoogleLogin", { failureRedirect: "/login" }, (err, user_id) => {
            const { response, UserAuthError } = this.generateToken(req, res, err, user_id);
            response.redirect("/");
        })(req, res, next);
    }

    public refresh(req: AuthenticatedRequest, res: Response) {
        let token = jwt.sign(req.user._id.toHexString(), process.env.JWT_SECRET);
        res.cookie("UserAuthToken", token, { sameSite: "lax", path: "/", httpOnly: true, secure: true, maxAge: 900000 });
        res.end();
    }

    public logout(req: AuthenticatedRequest, res: Response) {
        req.logout();
        res.clearCookie("UserAuthToken");
        req.user = undefined;
        res.status(200).end();
    }

    // ============================================================

    private generateToken(req: Request, res: Response, err, user_id) {
        let UserAuthError = null;

        if (err) {
            UserAuthError = err;
            res.cookie("UserAuthError", UserAuthError, { maxAge: 3000 });
            return { response: res, UserAuthError };
        }
        if (!user_id) {
            UserAuthError = "Invalide Username Or Password";
            res.cookie("UserAuthError", UserAuthError, { maxAge: 3000 });
            return { response: res, UserAuthError };
        }

        let token = "";
        let error = "";
        req.login(user_id, { session: false }, (err) => {
            if (err) error = err;

            token = jwt.sign(user_id, process.env.JWT_SECRET);
        });
        if (error) {
            res.cookie("UserAuthError", error, { maxAge: 3000 });
            console.error(error);
            return { response: res, UserAuthError: error };
        }

        // set a 15min cookie
        res.cookie("UserAuthToken", token, { sameSite: "lax", path: "/", httpOnly: true, secure: true, maxAge: 900000 });
        return { response: res, UserAuthError };
    }
}

export default AuthController;
