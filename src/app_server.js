import createApp from "./app";

export default (context) => {
    const { app, router } = createApp();

    app.mixin({
        methods: {
            getCookie(name) {
                if (name == "XSRF-TOKEN") {
                    return context.req.csrfToken();
                }
                return context.req.cookies[name];
            },
        },
    });

    return { app, router };
};
