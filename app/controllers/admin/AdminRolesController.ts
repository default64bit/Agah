import { Request, Response } from "express";
import mongoose from "mongoose";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import adminPermissionCheck from "../../helpers/adminPermissionCheck";
import Admin from "../../models/Admin";
import Permission from "../../models/Permission";
import AdminRole from "../../models/AdminRole";

class AdminRolesController {
    public async getRoles(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = req.query.pp ? parseInt(req.query.pp.toString()) : 25;
        let sort = "";
        switch (req.query.sort) {
            case "Name":
                sort = "name";
                break;
            case "Create Date":
                sort = "createdAt";
                break;
        }
        const sortType = req.query.sort_type ? req.query.sort_type : "asc";
        const search = req.query.search.toString();

        // the base query object including search params
        let query = {
            $or: [{ name: { $regex: new RegExp(`.*${search}.*`, "i") } }],
        };

        // date range filter query
        if (req.query.from_register_date && req.query.to_register_date) {
            query["createdAt"] = {
                $gte: new Date(req.query.from_register_date.toString()),
                $lte: new Date(req.query.to_register_date.toString()),
            };
        }

        // making the model with query
        let roles = AdminRole.model.find(query).select(["name", "createdAt"]);
        if (sort) {
            roles = roles.sort({
                [sort]: sortType,
            });
        }

        // executing query and getting the results
        const roleResults = await roles
            .limit(pp)
            .skip((page - 1) * pp)
            .exec()
            .catch((e) => {
                throw e;
            });

        const total = await AdminRole.model.find(query).countDocuments();

        return res.json({
            records: roleResults,
            page: page,
            total: total,
            pageTotal: Math.ceil(total / pp),
        });
    }

    public async getRole(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.params.id ? req.params.id : 0;

        // finding the model
        const role = await AdminRole.model
            .findById(id)
            .select(["name", "createdAt"])
            .populate("permissions", ["name"])
            .exec();
        if (!role) return res.status(404).end();

        return res.json(role);
    }

    public async addRole(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const roleName = req.body.roleName;
        const selectedPermissions = req.body.selectedPermissions;

        // check if the selectedPermissions is empty or not
        if (selectedPermissions.length === 0) {
            return res.status(422).json({
                error: "You must select at least one permission",
                field: "selectedPermissions",
            });
        }

        // check the uniqness of roleName
        const isRoleNameExists = await AdminRole.model.exists({ name: roleName });
        if (isRoleNameExists) {
            return res.status(422).json({
                error: "Role name must be unique",
                field: "roleName",
            });
        }

        let error = false;

        // get the list of permissions
        // const permissions = await Permission.model
        //     .find({ name: { $in: selectedPermissions } })
        //     .select(["_id"])
        //     .exec();

        await AdminRole.model
            .create({
                name: roleName,
                model: "Admin",
                permissions: selectedPermissions,
                createdAt: new Date(Date.now()),
            })
            .catch((e) => {
                error = true;
                console.log(e);
            });
        if (error) return res.status(500).end();

        return res.end();
    }

    public async editRole(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.body.id;
        const roleName = req.body.roleName;
        const selectedPermissions = req.body.selectedPermissions;

        // check if the selectedPermissions is empty or not
        if (selectedPermissions.length === 0) {
            return res.status(422).json({
                error: "You must select at least one permission",
                field: "selectedPermissions",
            });
        }

        // check the uniqness of roleName
        const isRoleNameExists = await AdminRole.model.findOne({ name: roleName }).exec();
        if (isRoleNameExists) {
            if (isRoleNameExists.id != id) {
                return res.status(422).json({
                    error: "Role name must be unique",
                    field: "roleName",
                });
            }
        }

        let error = false;

        // get the list of permissions
        // const permissions = await Permission.model
        //     .find({ name: { $in: selectedPermissions } })
        //     .select(["_id"])
        //     .exec();

        await AdminRole.model.updateOne({ _id: id }, { name: roleName, permissions: selectedPermissions }).catch((e) => {
            error = true;
        });
        if (error) return res.status(500).end();

        return res.end();
    }

    public async deleteRole(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();
        
        let id = mongoose.Types.ObjectId(req.params.id);

        const isRoleInUse = await Admin.model.findOne({ role: id }).exec();
        if (isRoleInUse) {
            return res.status(422).json({
                error: "This Role is currently in use for atleast one admin",
            });
        }

        // finding the model
        const role = await AdminRole.model.findByIdAndDelete(id).exec();
        if (!role) return res.status(404).end();

        return res.json(role);
    }
}

export default AdminRolesController;
