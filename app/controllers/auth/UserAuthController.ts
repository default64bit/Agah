import fs from "fs/promises";
import path from "path";
import { Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import moment, { now } from "moment";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import User from "../../models/User";
import Email from "../../Notifications/channels/Email";

class AuthController {
    private verficationCodeExpireTime = 60;

    public async login(req: Request, res: Response, next) {
        const username = req.body.username;

        const user = await User.model.findOne({ email: username }).exec();
        if (user) {
            // check if user is banned or not
            if (user.status == "banned") {
                return res.status(422).json({ error: "امکان ورود به سیستم برای شما نیست", field: "username" });
            }
            // check the time of last email sent
            let sendTime = moment(user.verficationCodeSentAt);
            let duration = moment.duration(moment(new Date()).diff(sendTime));
            if (duration.asSeconds() < this.verficationCodeExpireTime) return res.json({ expireIn: this.verficationCodeExpireTime - duration.asSeconds() });
        }

        // generate a 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000);

        // if the user does not exists before create the user
        await User.model.updateOne({ email: username }, { password: code.toString(), verficationCodeSentAt: new Date(Date.now()) }, { upsert: true }).exec();

        // send the code via email
        let html = await fs
            .readFile(path.join(__dirname, "..", "..", "Notifications", "templates", "verficationEmail.html"))
            .then((buffer) => buffer.toString());
        html = html.replace(/{{url}}/g, req.headers.origin);
        html = html.replace("{{code}}", code.toString());

        // await Email(`کد ورود ${code} | گروه وکلای آگه`, username, html).catch((e) => {
        //     console.log(e);
        // });

        return res.json({ expireIn: this.verficationCodeExpireTime });
    }

    public async verfication(req: Request, res: Response, next) {
        const username = req.body.username;
        const code = req.body.code;

        const user = await User.model.findOne({ email: username, password: code }).exec();
        if (!user) return res.status(422).json({ error: "کد وارد شده نادرست است", field: "code" });

        // check the time with verficationCodeSentAt field
        let sendTime = moment(user.verficationCodeSentAt);
        let duration = moment.duration(moment(new Date()).diff(sendTime));
        if (duration.asSeconds() > this.verficationCodeExpireTime) {
            return res.status(422).json({ error: "کد وارد شده منقضی شده، لطفا دوباره تلاش کنید", field: "code" });
        }

        // check if the name and family and mobile field is full
        if (!user.name || !user.family || !user.mobile) {
            return res.json({ register: true, name: user.name ?? "", family: user.family ?? "", mobile: user.mobile ?? "" });
        }

        // generate token
        const { response, UserAuthError } = this.generateToken(req, res, null, user._id.toString());
        return res.json({ register: false });
    }

    public async register(req: Request, res: Response, next) {
        const username = req.body.username;
        const code = req.body.code;
        const name = req.body.name;
        const family = req.body.family;
        const mobile = req.body.mobile;

        const user = await User.model.findOne({ email: username, password: code }).exec();
        if (!user) return res.status(422).json({ error: "کاربر پیدا نشد" });

        // update user's info and set status to active
        await User.model.updateOne({ email: username, password: code }, { name: name, family: family, mobile: mobile }).exec();

        // generate token and let the front know
        const { response, UserAuthError } = this.generateToken(req, res, null, user._id.toString());
        return res.end();
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
