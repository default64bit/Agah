import fs from "fs";
import path from "path";
import express from "express";
import expressWs from "express-ws";
import passport from "passport";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import csurf from "csurf";

import mongodbConnector from "./app/database/mongodbConnector";
import passportConfig from "./app/passportConfig";

// set up config file
dotenv.config({
    path: "app.env",
});

// database connection
mongodbConnector();

// make expressApp
const expressApp = express();

// make ws
const ws = expressWs(expressApp);

expressApp.use(cors({ origin: `http://${process.env.DOMAIN},https://${process.env.DOMAIN}` }));
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(cookieParser());

// set up passport strategies
passportConfig();
expressApp.use(passport.initialize());
require("https").globalAgent.options.rejectUnauthorized = false; // TOOD : remove this for non-localhost

// csrf protection
const csrfProtection = csurf({ cookie: true });
expressApp.use(function(err, req, res, next) {
    if (err.code !== "EBADCSRFTOKEN") return next(err);
    res.status(403).end();
});

// TODO
// create ignored folders (uploads & storage) if they not exists

// assign routes
expressApp.use("/api/v1", require("./app/routes/index").default);

expressApp.use("/sock/v1", require("./app/routes/adminSockets").default);
expressApp.use("/sock/v2", require("./app/routes/userSockets").default);

// expressApp.use("/seed", require("./app/database/seeder/seedPermissions").default);
// expressApp.use("/seed", require("./app/database/seeder/seed").default);

// SSR setup ==================================================================
{
    const { renderToString } = require("@vue/server-renderer");
    // const file_manifest = require("../vue/client/file-manifest.json");
    // const ssr_manifest = require("../vue/server/ssr-manifest.json");
    const file_manifest = require("./dist/vue/client/file-manifest.json");
    const ssr_manifest = require("./dist/vue/server/ssr-manifest.json");

    const appPath = path.join(__dirname, "dist", "vue", "server", ssr_manifest["app.js"]);
    // const appPath = path.join(__dirname, "..", "vue", "server", ssr_manifest["app.js"]);
    const createApp = require(appPath).default;

    // expressApp.use(file_manifest['precache-manifest.js'], express.static(path.join(__dirname, "dist", "vue", "client", file_manifest['precache-manifest.js'])));
    // expressApp.use("/service-worker.js", express.static(path.join(__dirname, "dist", "vue", "client", "service-worker.js")));
    // expressApp.use("/sw.js", express.static(path.join(__dirname, "dist", "vue", "client", "service-worker.js")));

    // expressApp.use("/manifest.json", express.static(path.join(__dirname, "..", "vue", "client", "manifest.json")));
    // expressApp.use("/img", express.static(path.join(__dirname, "..", "vue", "client", "img")));
    // expressApp.use("/js", express.static(path.join(__dirname, "..", "vue", "client", "js")));
    // expressApp.use("/css", express.static(path.join(__dirname, "..", "vue", "client", "css")));
    // expressApp.use("/fonts", express.static(path.join(__dirname, "..", "vue", "client", "fonts")));
    // expressApp.use("/media", express.static(path.join(__dirname, "..", "vue", "client", "media")));
    expressApp.use("/manifest.json", express.static(path.join(__dirname, "dist", "vue", "client", "manifest.json")));
    expressApp.use("/img", express.static(path.join(__dirname, "dist", "vue", "client", "img")));
    expressApp.use("/js", express.static(path.join(__dirname, "dist", "vue", "client", "js")));
    expressApp.use("/css", express.static(path.join(__dirname, "dist", "vue", "client", "css")));
    expressApp.use("/fonts", express.static(path.join(__dirname, "dist", "vue", "client", "fonts")));
    expressApp.use("/media", express.static(path.join(__dirname, "dist", "vue", "client", "media")));

    expressApp.use("/img/avatars", express.static(path.join(__dirname, "public", "avatars")));
    expressApp.use("/img/icons", express.static(path.join(__dirname, "public", "icons")));
    expressApp.use("/audio", express.static(path.join(__dirname, "public", "audio")));
    expressApp.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));
    expressApp.use("/fontawsome", express.static(path.join(__dirname, "public", "fontawsome")));

    expressApp.get("*", csrfProtection, async (req, res) => {
        res.cookie("XSRF-TOKEN", req.csrfToken(), { secure: true });
        const context = { url: req.url, req: req, state: null };
        const { app, router } = createApp(context);
        router.push(context.url);
        router.isReady().then(() => {
            renderToString(app, context).then((appContent) => {
                // fs.readFile(path.join(__dirname, "..", "vue", "client", "index.html"), "utf-8", (err, html) => {
                fs.readFile(path.join(__dirname, "dist", "vue", "client", "index.html"), "utf-8", (err, html) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    html = html.toString().replace('<div id="app">', `<div id="app">${appContent}`);
                    html = html.replace("<title>Vue App", `<title>AdminPanel`);
                    html = html.replace("<body", `<body dir="rtl" theme="light"`);
                    res.setHeader("Content-Type", "text/html");
                    res.send(html);
                });
            });
        });
    });
}
// SSR setup end ==================================================================

// start server
expressApp.listen(process.env.PORT);
