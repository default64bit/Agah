import { Request, Response } from "express";
import mongoose from "mongoose";
import moment from "moment";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import adminPermissionCheck from "../../helpers/adminPermissionCheck";
import Call from "../../models/Call";

class CallsController {
    public async getCalls(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = req.query.pp ? parseInt(req.query.pp.toString()) : 25;
        let sort = "";
        switch (req.query.sort) {
            case "گیرنده":
                sort = "caller.name";
                break;
            case "مخاطب":
                sort = "callee.name";
                break;
            case "مدت تماس":
                sort = "duration";
                break;
            case "تاریخ تماس":
                sort = "createdAt";
                break;
        }
        const sortType = req.query.sort_type ? req.query.sort_type : "asc";
        const search = req.query.search.toString();

        // the base query object including search params
        let query = {};

        // date range filter query
        if (req.query.from_register_date && req.query.to_register_date) {
            query["createdAt"] = {
                $gte: new Date(req.query.from_register_date.toString()),
                $lte: new Date(req.query.to_register_date.toString()),
            };
        }

        // making the model with query
        let data = Call.model
            .aggregate()
            .match(query)
            .lookup({
                from: "users",
                localField: "caller",
                foreignField: "_id",
                as: "caller_user",
            })
            .lookup({
                from: "admins",
                localField: "caller",
                foreignField: "_id",
                as: "caller_admin",
            })
            .lookup({
                from: "users",
                localField: "callee",
                foreignField: "_id",
                as: "callee_user",
            })
            .lookup({
                from: "admins",
                localField: "callee",
                foreignField: "_id",
                as: "callee_admin",
            })
            .match({
                $or: [
                    { "caller_user.name": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "caller_user.family": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "caller_user.email": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "caller_user.mobile": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "caller_admin.name": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "caller_admin.family": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "caller_admin.email": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "caller_admin.mobile": { $regex: new RegExp(`.*${search}.*`, "i") } },

                    { "callee_user.name": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "callee_user.family": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "callee_user.email": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "callee_user.mobile": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "callee_admin.name": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "callee_admin.family": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "callee_admin.email": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "callee_admin.mobile": { $regex: new RegExp(`.*${search}.*`, "i") } },
                ],
            });
        data = data.project(
            "caller_user.name caller_user.family caller_admin.name caller_admin.family callee_user.name callee_user.family callee_admin.name callee_admin.family duration createdAt"
        );

        // sorting
        if (sort) {
            data = data.sort({
                [sort]: sortType,
            });
        }

        // paginating
        data = data.facet({
            data: [{ $skip: (page - 1) * pp }, { $limit: pp }],
            total: [{ $group: { _id: null, count: { $sum: 1 } } }],
        });

        // executing query and getting the results
        const dataResults = await data.exec().catch((e) => {
            throw e;
        });

        const total = dataResults[0].total[0] ? dataResults[0].total[0].count : 0;

        // transform data
        dataResults[0].data.map((row) => {
            row.duration = moment.utc(moment.duration(row.duration,'seconds').as('milliseconds')).format('HH:mm:ss');
            return row;
        });

        return res.json({
            records: dataResults[0].data,
            page: page,
            total: total,
            pageTotal: Math.ceil(total / pp),
        });
    }

    public async getCall(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.params.id ? req.params.id : 0;

        // finding the model
        const role = await Call.model
            .findById(id)
            .select(["name", "createdAt"])
            .populate("permissions", ["name"])
            .exec();
        if (!role) return res.status(404).end();

        return res.json(role);
    }
}

export default CallsController;
