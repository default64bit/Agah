import createApp from "./app";

export default (context) => {
    const { app, router } = createApp(context);

    app.mixin({
        methods: {
            getBaseUrl() {
                return `${context.req.protocol}://${context.req.get('host')}`;
            },
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
