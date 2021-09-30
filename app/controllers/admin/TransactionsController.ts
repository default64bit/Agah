import { Request, Response } from "express";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import adminPermissionCheck from "../../helpers/adminPermissionCheck";
import BookedSchedule from "../../models/BookedSchedule";

class TransactionsController {
    public async getTransactions(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = req.query.pp ? parseInt(req.query.pp.toString()) : 25;
        let sort = "";
        switch (req.query.sort) {
            case "کاربر":
                sort = "user";
                break;
            case "مبلغ":
                sort = "transaction.amount";
                break;
            case "مبلغ پرداختی":
                sort = "transaction.payedAmount";
                break;
            case "کد تراکنش":
                sort = "transaction.transactionCode";
                break;
            case "وضعیت":
                sort = "transaction.status";
                break;
            case "ip":
                sort = "transaction.ip";
                break;
            case "تاریخ":
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
            .match({
                $or: [
                    { "user.name": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "user.family": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "user.email": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "user.mobile": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "transaction.amount": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "transaction.payedAmount": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "transaction.transactionCode": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "transaction.status": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "transaction.ip": { $regex: new RegExp(`.*${search}.*`, "i") } },
                ],
            });
        data = data.project(
            "user.name user.family transaction.amount transaction.payedAmount transaction.transactionCode transaction.status transaction.ip createdAt"
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

        return res.json({
            records: dataResults[0].data,
            page: page,
            total: total,
            pageTotal: Math.ceil(total / pp),
        });
    }
}

export default TransactionsController;
