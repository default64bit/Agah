import { createApp, createSSRApp } from "vue";
import createRouter from "./router";
import createStore from "./store";
import App from "./components/App.vue";
import "./assets/css/app.css";

export default (args) => {
    const isServer = typeof window === "undefined";
    const app = isServer ? createSSRApp(App) : createApp(App);
    // const app = createSSRApp(App);

    const router = createRouter();
    const store = createStore();

    app.use(router);
    app.use(store);

    app.mixin({
        methods: {
            getBaseUrl() {
                // TODO : make this dynamic
                return "http://localhost:3000";
            },
            checkPermissions(PermissionsToCheck = [], Permissions = [], style = "OR") {
                if (style == "AND") {
                    for (let i = 0; i < PermissionsToCheck.length; i++) {
                        if (Permissions.indexOf(PermissionsToCheck[i]) == -1) return false;
                    }
                    return true;
                } else {
                    for (let i = 0; i < PermissionsToCheck.length; i++) {
                        if (Permissions.indexOf(PermissionsToCheck[i]) != -1) return true;
                    }
                    return false;
                }
            },
        },
    });

    return { app, router };
};
