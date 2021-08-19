import { Request } from "express";

const PermissionAccessList = {
    "GET=>/admins": ["admin.admins.view"],
    "GET=>/admins/:id": ["admin.admins.view", "admin.admins.edit"],
    "POST=>/admins": ["admin.admins.add"],
    "PUT=>/admins": ["admin.admins.edit"],
    "DELETE=>/admins/:id": ["admin.admins.delete"],

    "GET=>/roles": ["admin.admin_roles.view"],
    "GET=>/role/:id": ["admin.admin_roles.view", "admin.admin_roles.edit"],
    "POST=>/roles": ["admin.admin_roles.add"],
    "PUT=>/roles": ["admin.admin_roles.edit"],
    "DELETE=>/role/:id": ["admin.admin_roles.delete"],

    "GET=>/licence_keys": ["admin.licence_keys.view"],
    "GET=>/licence_key/:id": ["admin.licence_keys.view", "admin.licence_keys.edit"],
    "POST=>/licence_keys": ["admin.licence_keys.add"],
    "PUT=>/licence_keys": ["admin.licence_keys.edit"],
    "DELETE=>/licence_key/:id": ["admin.licence_keys.delete"],

    "GET=>/users": ["users.view"],
    "GET=>/users/:id": ["users.view", "users.edit"],
    "POST=>/users": ["users.add"],
    "PUT=>/users": ["users.edit"],
    "DELETE=>/users/:id": ["users.delete"],

    "GET=>/permissions": [],

    "GET=>/panel_settings": ["admin.panel_settings.view"],
    "POST=>/panel_settings": ["admin.panel_settings.edit"],
};

export default (req: Request, admin) => {
    // TODO : remove this
    return true;

    if (!req.route) return false;

    const request = `${req.method}=>${req.route.path}`;
    if (!PermissionAccessList[request]) return false;
    let permissionList = PermissionAccessList[request];

    let adminPermissionList = [];
    for (let j = 0; j < admin.role.permissions.length; j++) {
        adminPermissionList.push(admin.role.permissions[j]._id);
    }

    for (let i = 0; i < permissionList.length; i++) {
        if (adminPermissionList.indexOf(permissionList[i]) == -1) {
            return false;
        }
    }

    return true;
};
