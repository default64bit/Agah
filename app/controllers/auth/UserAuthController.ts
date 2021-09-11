import fs from "fs/promises";
import path from "path";
import { Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import User from "../../models/User";
import EmailSender from "../../Notifications/channels/Email";

class AuthController {
    public async login(req: Request, res: Response, next) {
        const username = req.body.username;
        // generate a 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000);
        // if the user does not exists before create the user
        const user = await User.model
            .updateOne({ email: username }, { password: code.toString(), verficationCodeSentAt: new Date(Date.now()) }, { upsert: true })
            .exec();

        // send the code via email
        let html = await fs
            .readFile(path.join(__dirname, "..", "..", "Notifications", "templates", "verficationEmail.html"))
            .then((buffer) => buffer.toString());

        html = html.replace(/{{url}}/g, req.headers.origin);
        html = html.replace("{{code}}", code.toString());

        await EmailSender(`کد ورود ${code} | گروه وکلای آگه`, username, html).catch((e) => {
            console.log(e);
        });

        return res.end();
    }
    public async verfication(req: Request, res: Response, next) {
        const username = req.body.username;
        const code = req.body.code;
        
        // TODO
        // check the time with verficationCodeSentAt field
        // if it passed 5 minutes then don't accept
        // if code is valid and time is ok then check if the name and family and mobile field is full
        // if not then send response to go to register page
        // if user details is ok generate token and let the front know
    }
    public async register(req: Request, res: Response, next) {
        // TODO
        // get user's name family and mobile / verfication code and email
        // validate the input
        // update user's info
        // generate token and let the front know
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
