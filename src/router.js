import { createRouter, createMemoryHistory, createWebHistory } from "vue-router";

const isServer = typeof window === "undefined";
const history = isServer ? createMemoryHistory() : createWebHistory();

export default () => {
    return createRouter({
        history,
        routes: [
            //=========================================================================================================
            // user paths
            {
                path: "/",
                component: () => import("./components/templates/web/Main"),
                children: [
                    { path: "", component: () => import("./components/pages/web/Home"), name: "Home" },

                    { path: "frequently-asked-legal-questions/:page?", component: () => import("./components/pages/web/FAQ") },
                    { path: "blog/:page?", component: () => import("./components/pages/web/Blog") },
                    { path: "article/:url_code/:title?", component: () => import("./components/pages/web/Article") },
                    { path: "terms-and-conditions", component: () => import("./components/pages/web/TermsAndConditions") },

                    {
                        path: "consultation-time-booking",
                        component: () => import("./components/templates/web/Booking"),
                        children: [
                            { path: "", component: () => import("./components/pages/web/booking/SelectConsulter"), name: "consultation-time-booking" },
                            { path: "select-date/:consulter_id", component: () => import("./components/pages/web/booking/SelectDate"), name: "select-date" },
                            { path: "payment", component: () => import("./components/pages/web/booking/Payment"), name: "payment" },
                        ],
                    },

                    {
                        path: "profile",
                        component: () => import("./components/templates/web/Profile"),
                        children: [
                            {
                                path: "booked-schedules",
                                alias: "",
                                component: () => import("./components/pages/web/profile/BookedSchedulesList"),
                                name: "booked-schedules",
                            },
                            { path: "chat/:consulter_id?", component: () => import("./components/pages/web/profile/Chats"), name: "chats" },
                            { path: "notifications", component: () => import("./components/pages/web/profile/Notifications"), name: "notifications" },
                            { path: "settings", component: () => import("./components/pages/web/profile/Settings"), name: "profile-settings" },
                        ],
                    },
                ],
            },

            //=========================================================================================================
            // admin paths
            {
                path: "/admin",
                component: () => import("./components/templates/admin/Dashboard"),
                children: [
                    { path: "dashboard", alias: "", component: () => import("./components/pages/admin/Home"), name: "AdminHome" },

                    {
                        path: "account_settings",
                        component: () => import("./components/templates/admin/AccountSettings"),
                        children: [
                            { path: "profile", component: () => import("./components/pages/admin/account_settings/Profile") },
                            { path: "security", component: () => import("./components/pages/admin/account_settings/Security") },
                            { path: "notification", component: () => import("./components/pages/admin/account_settings/Notification") },
                        ],
                    },

                    { path: "admins_list", component: () => import("./components/pages/admin/admins_list/AdminsList") },
                    { path: "admins_list/create_admin", component: () => import("./components/pages/admin/admins_list/CreateAdmin") },
                    {
                        path: "admins_list/admin/:id",
                        component: () => import("./components/pages/admin/admins_list/EditAdminTemplate"),
                        children: [
                            { path: "", component: () => import("./components/pages/admin/admins_list/EditAdmin") },
                            { path: "schedules", component: () => import("./components/pages/admin/admins_list/Schedules") },
                            { path: "timeoff-schedules", component: () => import("./components/pages/admin/admins_list/TimeOffSchedules") },
                        ],
                    },

                    { path: "role_manager", component: () => import("./components/pages/admin/role_manager/RoleManager") },
                    { path: "role_manager/add_role", component: () => import("./components/pages/admin/role_manager/CreateRole") },
                    { path: "role_manager/role/:id", component: () => import("./components/pages/admin/role_manager/EditRole") },

                    {
                        path: "users",
                        component: () => import("./components/pages/admin/users/Users"),
                        children: [
                            { path: "info/:id?", alias: "", component: () => import("./components/pages/admin/users/Info") },
                            { path: "chat/:id?", component: () => import("./components/pages/admin/users/Chat") },
                            { path: "schedules/:id?", component: () => import("./components/pages/admin/users/Schedules") },
                            { path: "transactions/:id?", component: () => import("./components/pages/admin/users/Transactions") },
                        ],
                    },

                    { path: "booked_schedules", component: () => import("./components/pages/admin/booked_schedules/BookedSchedules") },
                    { path: "booked_schedules/:id", component: () => import("./components/pages/admin/booked_schedules/EditSchedule") },

                    { path: "calls", component: () => import("./components/pages/admin/calls/Calls") },
                    { path: "transactions", component: () => import("./components/pages/admin/transactions/Transactions") },

                    { path: "articles", component: () => import("./components/pages/admin/articles/ArticleList") },
                    { path: "articles/new", component: () => import("./components/pages/admin/articles/CreateArticle") },
                    { path: "articles/:id", component: () => import("./components/pages/admin/articles/EditArticle") },

                    { path: "faqs", component: () => import("./components/pages/admin/faqs/FaqList") },
                    { path: "faqs/new", component: () => import("./components/pages/admin/faqs/CreateFaq") },
                    { path: "faqs/:id", component: () => import("./components/pages/admin/faqs/EditFaq") },

                    { path: "panel_settings", component: () => import("./components/pages/admin/PanelSettings") },
                ],
            },
            { path: "/admin/login", component: () => import("./components/pages/admin/Login"), name: "AdminLogin" },

            //=========================================================================================================
            // static paths
            { path: "/:catchAll(.*)", component: () => import("./components/pages/NotFound"), name: "404" },
        ],
        scrollBehavior(to, from, savedPosition) {
            document.querySelector("#app").scrollTop = 0;
            return { x: 0, y: 0 };
        },
    });
};
