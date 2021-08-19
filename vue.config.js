const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const nodeExternals = require("webpack-node-externals");
const webpack = require("webpack");

module.exports = {
    pwa: {
        name: "Admin Panel",
        themeColor: "#a78bfa",
        msTileColor: "#000000",
        appleMobileWebAppCapable: "yes",
        appleMobileWebAppStatusBarStyle: "black",

        // workboxPluginMode: "InjectManifest",
        workboxPluginMode: "GenerateSW",
        // workboxOptions: {
        //     swSrc: "sw.js",
        // },
    },

    css: {
        extract: true,
        // requireModuleExtension: false,
    },
    chainWebpack: (webpackConfig) => {
        // We need to disable cache loader, otherwise the client build
        // will used cached components from the server build
        webpackConfig.module.rule("vue").uses.delete("cache-loader");
        webpackConfig.module.rule("js").uses.delete("cache-loader");
        webpackConfig.module.rule("ts").uses.delete("cache-loader");
        webpackConfig.module.rule("tsx").uses.delete("cache-loader");

        webpackConfig.plugin("html").tap((args) => {
            args[0].title = "Admin Panel Template";
            return args;
        });

        if (!process.env.SSR) {
            // Point entry to your app's client entry file
            webpackConfig
                .entry("app")
                .clear()
                .add("./src/app_client.js");

            webpackConfig.plugin("manifest").use(new WebpackManifestPlugin({ fileName: "file-manifest.json" }));

            return;
        }

        // Point entry to your app's server entry file
        webpackConfig
            .entry("app")
            .clear()
            .add("./src/app_server.js");

        webpackConfig.target("node");
        webpackConfig.output.libraryTarget("commonjs2");

        webpackConfig.plugin("manifest").use(new WebpackManifestPlugin({ fileName: "ssr-manifest.json" }));

        // Do not externalize dependencies that need to be processed by webpack.
        // You should also whitelist deps that modify `global` (e.g. polyfills)
        webpackConfig.externals(nodeExternals({ allowlist: /\.(css|vue)$/ }));

        webpackConfig.optimization.splitChunks(false).minimize(false);

        webpackConfig.plugins.delete("hmr");
        webpackConfig.plugins.delete("preload");
        webpackConfig.plugins.delete("prefetch");
        webpackConfig.plugins.delete("progress");
        // webpackConfig.plugins.delete("friendly-errors");

        webpackConfig.plugin("limit").use(
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            })
        );

        // console.log(webpackConfig.toConfig());
    },
};
