import { Request, Response } from "express";
import Faq from "../../models/Faq";

class Controller {
    public async getRandomFaqs(req: Request, res: Response) {
        const faqCounts = await Faq.model.countDocuments().exec();

        const randomFaqs = [];
        for (let i = 0; i < 5; i++) {
            let random = Math.floor(Math.random() * faqCounts);
            const faq = await Faq.model
                .findOne({ status: "published" })
                .skip(random)
                .select("-author -status -createdAt")
                .exec();
            randomFaqs.push(faq);
        }

        res.json(randomFaqs);
    }
    public async getFaqs(req: Request, res: Response) {
        const search = req.query.search.toString();
        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = 20;

        let query = {};
        query["status"] = "published";

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
                    { question: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { answer: { $regex: new RegExp(`.*${search}.*`, "i") } },
                ],
            })
            .project("-_id author.name author.family question answer")
            .sort({ createdAt: "desc" });

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

export default Controller;
