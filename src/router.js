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
                component: () => import("./components/templates/user/Dashboard"),
                children: [
                    { path: "", component: () => import("./components/pages/user/Home"), name: "Home" },
                    { path: "room/:roomId?", component: () => import("./components/pages/user/Room"), name: "Room" },
                    {
                        path: "account-settings",
                        component: () => import("./components/templates/user/AccountSettings"),
                        children: [
                            { path: "profile", component: () => import("./components/pages/user/account_settings/Profile") },
                            { path: "security", component: () => import("./components/pages/user/account_settings/Security") },
                            { path: "notification", component: () => import("./components/pages/user/account_settings/Notification") },
                        ],
                    },
                    {
                        path: "panel-settings",
                        component: () => import("./components/templates/user/PanelSettings"),
                        children: [
                            // { path: "language-and-region", component: () => import("./components/pages/user/panel_settings/LanguageAndRegion") },
                            // { path: "theme", component: () => import("./components/pages/user/panel_settings/Theme") },
                        ],
                    },
                ],
            },
            { path: "/login", component: () => import("./components/pages/user/Login"), name: "Login" },
            { path: "/register", component: () => import("./components/pages/user/Register"), name: "Register" },
            { path: "/forgot-password", component: () => import("./components/pages/user/ForgotPassword"), name: "ForgotPassword" },

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
                    // { path: "admins_list/admin/:id", component: () => import("./components/pages/admin/admins_list/EditAdmin") },
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
                            { path: "info/:id?", alias:"", component: () => import("./components/pages/admin/users/Info") },
                            { path: "chat/:id?", component: () => import("./components/pages/admin/users/Chat") },
                            { path: "schedules/:id?", component: () => import("./components/pages/admin/users/Schedules") },
                            { path: "transactions/:id?", component: () => import("./components/pages/admin/users/Transactions") },
                        ],
                    },

                    { path: "calls", component: () => import("./components/pages/admin/calls/Calls") },

                    { path: "panel_settings", component: () => import("./components/pages/admin/PanelSettings") },
                ],
            },
            { path: "/admin/login", component: () => import("./components/pages/admin/Login"), name: "AdminLogin" },

            //=========================================================================================================
            // static paths
            { path: "/:catchAll(.*)", component: () => import("./components/pages/NotFound") },
        ],
    });
};
