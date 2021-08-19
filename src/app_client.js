import createApp from "./app";
import cookies from "js-cookie";

const { app, router } = createApp();
router.isReady().then(() => {
    app.mixin({
        methods: {
            getCookie(name) {
                return cookies.get(name);
            },
        },
    });

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/sw.js");
        });
    }

    app.mount("#app");
});
