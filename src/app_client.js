import createApp from "./app";
import cookies from "js-cookie";
import VueGtag, { trackRouter } from "vue-gtag-next";

const { app, router } = createApp();
router.isReady().then(() => {
    app.mixin({
        methods: {
            getBaseUrl() {
                return window.location.origin;
            },
            getCookie(name) {
                return cookies.get(name);
            },
            updateMetaData(title, desc, author, image) {
                // this function can be used only in client-side and on a route change
                if (typeof window === "undefined") return;
                // find meta elements and replace them with new values
                window.document.querySelector("title").innerText = title;
                window.document.querySelector('meta[name="description"]').setAttribute("content", desc);
                if (!!window.document.querySelector('meta[name="author"]')) {
                    window.document.querySelector('meta[name="author"]').setAttribute("content", author);
                }
                window.document.querySelector('meta[property="og:image"]').setAttribute("content", image);
                window.document.querySelector('meta[name="twitter:image"]').setAttribute("content", image);
            },
        },
    });

    app.use(VueGtag, {
        property: {
            id: "UA-125899565-1",
        },
    });
    trackRouter(router);

    // TODO : activate this and make a propper PWA than can handle push notifs and can get calls and such
    // if ("serviceWorker" in navigator) {
    //     window.addEventListener("load", () => {
    //         navigator.serviceWorker.register("/sw.js");
    //     });
    // }

    app.mount("#app");
});
