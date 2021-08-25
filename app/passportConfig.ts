import googleOauth20 from "passport-google-oauth20";
import passportLocal from "passport-local";
import passport from "passport";
import passportJWT from "passport-jwt";
import TokenObj from "./interfaces/TokenObj";
import Admin from "./models/Admin";
import User from "./models/User";

export default () => {
    // =====================================================================
    // Admin Auth

    passport.use(
        "adminGoogleLogin",
        new googleOauth20.Strategy(
            {
                clientID: process.env.GOOGLE_LOGIN_CLIENT_ID,
                clientSecret: process.env.GOOGLE_LOGIN_CLIENT_SECRET,
                callbackURL: "/api/v1/admin/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, callback) => {
                let admin = await Admin.model.findOne({ email: profile._json.email });
                if (admin) {
                    if (admin.status != "active") {
                        return callback("You are banned from the system", null);
                    }
                    await admin.updateOne({ googleID: profile.id });
                    callback(null, admin.id);
                } else {
                    callback("There is no user with that email in our system. Please make sure to register", null);
                }
            }
        )
    );

    passport.use(
        "adminLogin",
        new passportLocal.Strategy(
            {
                usernameField: "username",
                passwordField: "password",
                session: false,
            },
            async (username, password, callback) => {
                let admin = await Admin.model.findOne({ email: username });
                if (!admin) {
                    return callback("Invalide Username Or Password", null);
                }
                if (admin.status != "active") {
                    return callback("You are banned from the system", null);
                }

                const validate = await Admin.checkPass(admin.password, password);
                if (!validate) {
                    return callback("Invalide Username Or Password", null);
                }

                callback(null, admin.id);
            }
        )
    );

    passport.use(
        "adminAuthCheck",
        new passportJWT.Strategy(
            {
                secretOrKey: process.env.JWT_SECRET,
                jwtFromRequest: (req): string => {
                    let token = "";
                    if (req.headers["adminauthtoken"]) token = req.headers["adminauthtoken"].toString();
                    if (req.cookies["AdminAuthToken"]) token = req.cookies["AdminAuthToken"].toString();
                    return token;
                },
            },
            async (jwtPayload, callback) => {
                let admin = await Admin.model.findById(jwtPayload).exec();
                if (admin) {
                    if (admin.status != "active") {
                        return callback(403, null);
                    }
                    callback(null, admin.id);
                } else {
                    callback(401, null);
                }
            }
        )
    );

    // =====================================================================
    // User Auth

    passport.use(
        "userGoogleLogin",
        new googleOauth20.Strategy(
            {
                clientID: process.env.GOOGLE_LOGIN_CLIENT_ID,
                clientSecret: process.env.GOOGLE_LOGIN_CLIENT_SECRET,
                callbackURL: "/api/v1/user/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, callback) => {
                let user = await User.model.findOne({ email: profile._json.email });
                if (user) {
                    if (user.status != "active") {
                        return callback("You are banned from the system", null);
                    }
                    await user.updateOne({ googleID: profile.id });
                    callback(null, user.id);
                } else {
                    user = await User.model.create({
                        googleID: profile.id,
                        image: profile._json.picture,
                        email: profile._json.email,
                        name: profile._json.given_name,
                        // family: profile._json.family_name,
                        family: profile.name.familyName,
                        password: await User.hash(profile.id),
                    });

                    callback(null, user.id);
                }
            }
        )
    );

    passport.use(
        "userLogin",
        new passportLocal.Strategy(
            {
                usernameField: "username",
                passwordField: "password",
                session: false,
            },
            async (username, password, callback) => {
                let user = await User.model.findOne({ email: username });
                if (!user) {
                    return callback("Invalide Username Or Password", null);
                }
                if (user.status != "active") {
                    return callback("You are banned from the system", null);
                }

                const validate = await User.checkPass(user.password, password);
                if (!validate) {
                    return callback("Invalide Username Or Password", null);
                }

                callback(null, user.id);
            }
        )
    );

    passport.use(
        "userAuthCheck",
        new passportJWT.Strategy(
            {
                secretOrKey: process.env.JWT_SECRET,
                jwtFromRequest: (req): string => {
                    let token = "";
                    if (req.headers["userauthtoken"]) token = req.headers["userauthtoken"].toString();
                    if (req.cookies["UserAuthToken"]) token = req.cookies["UserAuthToken"].toString();
                    return token;
                },
            },
            async (jwtPayload, callback) => {
                let user = await User.model.findById(jwtPayload);
                if (user) {
                    if (user.status != "active") {
                        return callback(403, null);
                    }
                    callback(null, user.id);
                } else {
                    callback(401, null);
                }
            }
        )
    );
};
