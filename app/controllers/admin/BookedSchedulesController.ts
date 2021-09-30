import { Request, Response } from "express";
import moment from "moment";
import mongoose from "mongoose";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import adminPermissionCheck from "../../helpers/adminPermissionCheck";
import BookedSchedule from "../../models/BookedSchedule";

class BookedSchedulesController {
    public async getBookedSchedules(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = req.query.pp ? parseInt(req.query.pp.toString()) : 25;
        let sort = "";
        switch (req.query.sort) {
            case "کاربر":
                sort = "user";
                break;
            case "مشاور":
                sort = "consulter";
                break;
            case "زمان مشاوره":
                sort = "dateRaw";
                break;
            case "نوع":
                sort = "type";
                break;
            case "وضعیت":
                sort = "status";
                break;
            case "تاریخ ثبت":
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
        let data = BookedSchedule.model
            .aggregate()
            .match(query)
            .lookup({
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
            })
            .lookup({
                from: "admins",
                localField: "consulter",
                foreignField: "_id",
                as: "consulter",
            })
            .match({
                $or: [
                    { "user.name": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "user.family": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "consulter.name": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "consulter.family": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { dateRaw: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { date: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { status: { $regex: new RegExp(`.*${search}.*`, "i") } },
                ],
            });
        data = data.project("user.name user.family consulter.name consulter.family date time type status createdAt");

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

        return res.json({
            records: dataResults[0].data,
            page: page,
            total: total,
            pageTotal: Math.ceil(total / pp),
        });
    }

    public async getBookedSchedule(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.params.id ? req.params.id : 0;

        // finding the model
        const bookedSchedule = await BookedSchedule.model
            .findById(id)
            .populate("user")
            .populate("consulter")
            .exec();
        if (!bookedSchedule) return res.status(404).end();

        return res.json(bookedSchedule);
    }

    public async editBookedSchedule(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.body.id;
        const bookedSchedule = await BookedSchedule.model.findById(id).exec();
        if (!bookedSchedule) {
            return res.status(404).json({
                error: "bookeds schedule does not exists",
            });
        }

        const dateRaw = req.body.dateRaw;
        const time = req.body.time;
        const duration = req.body.duration;
        const type = req.body.type;
        const status = req.body.status;

        const bookedScheduleUpdated = await BookedSchedule.model
            .updateOne(
                { _id: bookedSchedule._id },
                {
                    dateRaw: new Date(moment(dateRaw).format("yyyy-MM-DD")),
                    date: moment(dateRaw).format("yyyy-MM-DD"),
                    time: time,
                    duration: duration,
                    type: type,
                    status: status,
                }
            )
            .exec();
        if (!bookedScheduleUpdated) return res.status(500).end();

        return res.end();
    }

    public async deleteBookedSchedule(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        let id = mongoose.Types.ObjectId(req.params.id);

        // finding the model
        const bookedSchedule = await BookedSchedule.model.findByIdAndDelete(id).exec();
        if (!bookedSchedule) return res.status(404).end();

        return res.json(bookedSchedule);
    }
}

export default BookedSchedulesController;
