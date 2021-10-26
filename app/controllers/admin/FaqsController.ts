import { Request, Response } from "express";
import mongoose from "mongoose";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import adminPermissionCheck from "../../helpers/adminPermissionCheck";
import Faq from "../../models/Faq";

class AdminRolesController {
    public async getFaqs(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = req.query.pp ? parseInt(req.query.pp.toString()) : 25;
        let sort = "";
        switch (req.query.sort) {
            case "عنوان":
                sort = "title";
                break;
            case "نویسنده":
                sort = "author.name";
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
        let data = Faq.model
            .aggregate()
            .match(query)
            .lookup({
                from: "admins",
                localField: "author",
                foreignField: "_id",
                as: "author",
            })
            .match({
                $or: [
                    { "author.name": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "author.family": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { question: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { answer: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { status: { $regex: new RegExp(`.*${search}.*`, "i") } },
                ],
            });
        data = data.project("author.name author.family question answer status createdAt");

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

    public async getFaq(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.params.id ? req.params.id : 0;

        // finding the model
        const faq = await Faq.model
            .findById(id)
            .populate("author", ["image", "name", "family"])
            .exec();
        if (!faq) return res.status(404).end();

        return res.json(faq);
    }

    public async addFaq(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const question = req.body.question;
        const answer = req.body.answer;
        const status = req.body.status;

        const faq = await Faq.model
            .create({ author: req.admin._id, question: question, answer: answer, status: status, createdAt: new Date(Date.now()) })
            .then((doc) => doc)
            .catch((e) => {
                console.log(e);
            });
        if (!faq) return res.status(500).end();

        return res.json(faq);
    }

    public async editFaq(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.body.id;
        const faq = await Faq.model.findById(req.body.id).exec();
        if (!faq) {
            return res.status(404).json({
                error: "faq does not exists",
            });
        }

        const question = req.body.question;
        const answer = req.body.answer;
        const status = req.body.status;

        const faqUpdated = await Faq.model.updateOne({ _id: faq._id }, { question: question, answer: answer, status: status }).exec();
        if (!faqUpdated) return res.status(500).end();

        return res.end();
    }

    public async deleteFaq(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        let id = mongoose.Types.ObjectId(req.params.id);

        // finding the model
        const faq = await Faq.model.findByIdAndDelete(id).exec();
        if (!faq) return res.status(404).end();

        return res.json(faq);
    }
}

export default AdminRolesController;
