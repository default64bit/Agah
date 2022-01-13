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
import scheduler from "./app/scheduler/handler";

// set up config file
dotenv.config({
    path: "app.env",
});

// set the timezone to Asia/Tehran
process.env.TZ = "Asia/Tehran";

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

expressApp.enable("trust proxy");

// assign routes
expressApp.use("/api/v1", require("./app/routes/index").default);
expressApp.use("/file/:fileId", require("./app/controllers/FileController").default);

expressApp.use("/sock/v1", require("./app/routes/adminSockets").default);
expressApp.use("/sock/v2", require("./app/routes/userSockets").default);

expressApp.use("/seed", require("./app/database/seeder/seed").default);
// expressApp.use("/seed/permissions", require("./app/database/seeder/seedPermissions").default);

expressApp.use("/import/:filename", require("./app/helpers/importer").default);

// SSR setup ==================================================================
{
    const { renderToString } = require("@vue/server-renderer");
    const { generateMetaData } = require("./app/MetaDataHandler");

    let basePath = "./dist/";
    if (process.env.BUILD_STATE == "prod") basePath = "../";
    const file_manifest = require(`${basePath}vue/client/file-manifest.json`);
    const ssr_manifest = require(`${basePath}vue/server/ssr-manifest.json`);

    basePath = path.join(__dirname, "dist");
    if (process.env.BUILD_STATE == "prod") basePath = path.join(__dirname, "..");

    const appPath = path.join(basePath, "vue", "server", ssr_manifest["app.js"]);
    const createApp = require(appPath).default;

    // expressApp.use(file_manifest['precache-manifest.js'], express.static(path.join(basePath, "vue", "client", file_manifest['precache-manifest.js'])));
    // expressApp.use("/service-worker.js", express.static(path.join(basePath, "vue", "client", "service-worker.js")));
    // expressApp.use("/sw.js", express.static(path.join(basePath, "vue", "client", "service-worker.js")));

    expressApp.use("/manifest.json", express.static(path.join(basePath, "vue", "client", "manifest.json")));
    expressApp.use("/img", express.static(path.join(basePath, "vue", "client", "img")));
    expressApp.use("/js", express.static(path.join(basePath, "vue", "client", "js")));
    expressApp.use("/css", express.static(path.join(basePath, "vue", "client", "css")));
    expressApp.use("/fonts", express.static(path.join(basePath, "vue", "client", "fonts")));
    expressApp.use("/media", express.static(path.join(basePath, "vue", "client", "media")));

    let publicPath = "";
    if (process.env.BUILD_STATE == "prod") publicPath = "../../";
    expressApp.use("/img/avatars", express.static(path.join(__dirname, publicPath, "public", "avatars")));
    expressApp.use("/img/icons", express.static(path.join(__dirname, publicPath, "public", "icons")));
    expressApp.use("/img/articles", express.static(path.join(__dirname, publicPath, "public", "articles")));
    expressApp.use("/audio", express.static(path.join(__dirname, publicPath, "public", "audio")));
    expressApp.use("/favicon.ico", express.static(path.join(__dirname, publicPath, "public", "favicon.ico")));
    expressApp.use("/fontawsome", express.static(path.join(__dirname, publicPath, "public", "fontawsome")));
    expressApp.use("/sitemap.xml", express.static(path.join(__dirname, publicPath, "public", "sitemap.xml")));

    expressApp.get("*", csrfProtection, async (req, res) => {
        res.cookie("XSRF-TOKEN", req.csrfToken(), { secure: true });
        const context = { url: req.url, req: req, state: null };
        const { app, router } = createApp(context);

        router.push(context.url);
        router.isReady().then(async (t) => {
            renderToString(app, context).then((appContent) => {
                // fs.readFile(path.join(__dirname, "..", "vue", "client", "index.html"), "utf-8", (err, html) => {
                fs.readFile(path.join(basePath, "vue", "client", "index.html"), "utf-8", async (err, html) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    html = html.toString().replace('<div id="app">', `<div id="app">${appContent}`);
                    html = html.replace(`html lang=""`, `html lang="fa"`);
                    html = html.replace("<title>Vue App</title>", await generateMetaData(context.url));
                    html = html.replace("<body", `<body dir="rtl" theme="default_light" lang="fa"`);
                    res.setHeader("Content-Type", "text/html");
                    if (router.currentRoute._value.name == "404") res.status(404);
                    res.send(html);
                });
            });
        });
    });
}
// SSR setup end ==================================================================

// start server
expressApp.listen(process.env.PORT, async () => {
    // database connection
    await mongodbConnector();

    // setup scheduler
    scheduler();
});
