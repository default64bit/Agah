import Permission from "../../models/Permission";

export default async () => {
    await Permission.model.collection.drop().catch((e) => {});

    return new Promise(async (resolve, reject) => {
        await Permission.model
            .insertMany(
                [
                    { _id: "admin.general.login_as_user", label: "Can Login As Users", group: "general", type: "AdminOnly" },

                    { _id: "admin.dashboard.view", label: "View Dashboard", group: "dashboard", type: "AdminOnly" },

                    { _id: "admin.admins.view", label: "View Admins", group: "admins", type: "AdminOnly" },
                    { _id: "admin.admins.add", label: "Create New Admins", group: "admins", type: "AdminOnly" },
                    { _id: "admin.admins.edit", label: "Edit Admins Info", group: "admins", type: "AdminOnly" },
                    { _id: "admin.admins.delete", label: "Delete Admins", group: "admins", type: "AdminOnly" },

                    { _id: "admin.admin_roles.view", label: "View Admin Roles", group: "admin roles", type: "AdminOnly" },
                    { _id: "admin.admin_roles.add", label: "Create New Admin Roles", group: "admin roles", type: "AdminOnly" },
                    { _id: "admin.admin_roles.edit", label: "Edit Admin Roles Name And Permission", group: "admin roles", type: "AdminOnly" },
                    { _id: "admin.admin_roles.delete", label: "Delete Admin Roles", group: "admin roles", type: "AdminOnly" },

                    { _id: "admin.users.view", label: "View Users", group: "users", type: "AdminOnly" },
                    { _id: "admin.users.chat", label: "Send A Message To Users", group: "users", type: "AdminOnly" },
                    { _id: "admin.users.call", label: "Call Users", group: "users", type: "AdminOnly" },
                    { _id: "admin.users.edit", label: "Edit Users", group: "users", type: "AdminOnly" },
                    { _id: "admin.users.delete", label: "Delete Users", group: "users", type: "AdminOnly" },

                    { _id: "admin.calls.view", label: "View Calls", group: "calls", type: "AdminOnly" },

                    { _id: "admin.articles.view", label: "View Articles", group: "articles", type: "AdminOnly" },
                    { _id: "admin.articles.add", label: "Create New Articles", group: "articles", type: "AdminOnly" },
                    { _id: "admin.articles.edit", label: "Edit Articles", group: "articles", type: "AdminOnly" },
                    { _id: "admin.articles.delete", label: "Delete Articles", group: "articles", type: "AdminOnly" },

                    { _id: "admin.panel_settings.view", label: "View Panel Settings", group: "panel settings", type: "AdminOnly" },
                    { _id: "admin.panel_settings.edit", label: "Edit Panel Settings", group: "panel settings", type: "AdminOnly" },
                ],
                {}
            )
            .then((doc) => {
                console.log("Permissions Seed Successfully");
                resolve(true);
            })
            .catch((e) => {
                console.error(e);
                reject(e);
            });
    });
};
