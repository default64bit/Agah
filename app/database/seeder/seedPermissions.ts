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

                    { _id: "admin.licence_keys.view", label: "View Licence Keys", group: "licence keys", type: "AdminOnly" },
                    { _id: "admin.licence_keys.add", label: "Create New Licence Keys", group: "licence keys", type: "AdminOnly" },
                    { _id: "admin.licence_keys.edit", label: "Edit Licence Keys", group: "licence keys", type: "AdminOnly" },
                    { _id: "admin.licence_keys.delete", label: "Delete Licence Keys", group: "licence keys", type: "AdminOnly" },

                    { _id: "admin.users.view", label: "View Users", group: "users", type: "AdminOnly" },
                    { _id: "admin.users.add", label: "Create New Users", group: "users", type: "AdminOnly" },
                    { _id: "admin.users.edit", label: "Edit User's Name And Info", group: "users", type: "AdminOnly" },
                    { _id: "admin.users.delete", label: "Delete Users", group: "users", type: "AdminOnly" },

                    { _id: "admin.user_roles.view", label: "View User Roles", group: "user roles", type: "AdminOnly" },
                    { _id: "admin.user_roles.add", label: "Create New User Roles", group: "user roles", type: "AdminOnly" },
                    { _id: "admin.user_roles.edit", label: "Edit User Roles Name And Permission", group: "user roles", type: "AdminOnly" },
                    { _id: "admin.user_roles.delete", label: "Delete User Roles", group: "user roles", type: "AdminOnly" },

                    { _id: "admin.user_teams.view", label: "View Teams", group: "teams", type: "AdminOnly" },
                    { _id: "admin.user_teams.add", label: "Create New Teams", group: "teams", type: "AdminOnly" },
                    { _id: "admin.user_teams.edit", label: "Edit User Team's Members", group: "teams", type: "AdminOnly" },
                    { _id: "admin.user_teams.delete", label: "Delete Teams", group: "teams", type: "AdminOnly" },

                    { _id: "admin.organizations.view", label: "View Organizations", group: "organizations", type: "AdminOnly" },
                    { _id: "admin.organizations.add", label: "Create New Organizations", group: "organizations", type: "AdminOnly" },
                    { _id: "admin.organizations.edit", label: "Edit Organizations Info", group: "organizations", type: "AdminOnly" },
                    { _id: "admin.organizations.delete", label: "Delete Organizations", group: "organizations", type: "AdminOnly" },

                    { _id: "admin.panel_settings.view", label: "View Panel Settings", group: "panel settings", type: "AdminOnly" },
                    { _id: "admin.panel_settings.edit", label: "Edit Panel Settings", group: "panel settings", type: "AdminOnly" },
                    
                    // ======================================================
                    
                    { _id: "user.organizations.view", label: "View Organizations", group: "organizations", type: "UserOnly" },
                    { _id: "user.organizations.view.licence", label: "View Organization's Licence", group: "organizations", type: "UserOnly" },
                    { _id: "user.organizations.edit", label: "Edit Organizations Info", group: "organizations", type: "UserOnly" },
                    { _id: "user.organizations.delete", label: "Delete Organizations", group: "organizations", type: "UserOnly" },

                    { _id: "user.roles.view", label: "View Roles", group: "roles", type: "UserOnly" },
                    { _id: "user.roles.add", label: "Create New Roles", group: "roles", type: "UserOnly" },
                    { _id: "user.roles.edit", label: "Edit Roles Name And Permission", group: "roles", type: "UserOnly" },
                    { _id: "user.roles.delete", label: "Delete Roles", group: "roles", type: "UserOnly" },

                    { _id: "user.members.view", label: "View Members", group: "members", type: "UserOnly" },
                    { _id: "user.members.invite", label: "Invite New Member", group: "members", type: "UserOnly" },
                    { _id: "user.members.edit", label: "Edit Members Roles", group: "members", type: "UserOnly" },
                    { _id: "user.members.delete", label: "Remove Member", group: "members", type: "UserOnly" },

                    { _id: "user.teams.view", label: "View Teams", group: "teams", type: "UserOnly" },
                    { _id: "user.teams.add", label: "Create New Team", group: "teams", type: "UserOnly" },
                    { _id: "user.teams.edit", label: "Edit Teams Info And Members", group: "teams", type: "UserOnly" },
                    { _id: "user.teams.delete", label: "Delete Teams", group: "teams", type: "UserOnly" },

                    { _id: "user.stores.view", label: "View Stores", group: "stores", type: "UserOnly" },
                    { _id: "user.stores.add", label: "Create New Store", group: "stores", type: "UserOnly" },
                    { _id: "user.stores.edit", label: "Edit Stores Info", group: "stores", type: "UserOnly" },
                    { _id: "user.stores.delete", label: "Delete Stores", group: "stores", type: "UserOnly" },

                    { _id: "user.parts.view", label: "View Parts", group: "parts", type: "UserOnly" },
                    { _id: "user.parts.add", label: "Create New Part", group: "parts", type: "UserOnly" },
                    { _id: "user.parts.edit", label: "Edit Part Info And Counts", group: "parts", type: "UserOnly" },
                    { _id: "user.parts.delete", label: "Delete Parts", group: "parts", type: "UserOnly" },

                    { _id: "user.locations.view", label: "View Locations", group: "locations", type: "UserOnly" },
                    { _id: "user.locations.add", label: "Create New Location", group: "locations", type: "UserOnly" },
                    { _id: "user.locations.edit", label: "Edit Location Info", group: "locations", type: "UserOnly" },
                    { _id: "user.locations.delete", label: "Delete Locations", group: "locations", type: "UserOnly" },

                    { _id: "user.files.delete", label: "Delete Files", group: "files", type: "UserOnly" },

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
