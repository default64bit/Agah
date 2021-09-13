import { Request, Response } from "express";
import Article from "../../models/Article";

class NotificationController {
    public async getRandomArticles(req: Request, res: Response) {
        const articlesCount = await Article.model.countDocuments().exec();

        const randomArticles = [];
        for (let i = 0; i < 5; i++) {
            let random = Math.floor(Math.random() * articlesCount);
            const faq = await Article.model
                .findOne({ status: "published" })
                .skip(random)
                .select("author image title desc url_code publishedAt")
                .populate("author", "image name family -_id")
                .exec();
            randomArticles.push(faq);
        }

        res.json(randomArticles);
    }

    public async getArticles(req: Request, res: Response) {
        const search = req.query.search.toString();
        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = 20;

        let query = {};
        query["status"] = "published";

        let data = Article.model
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
                    { title: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { desc: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { text: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { tags: { $regex: new RegExp(`.*${search}.*`, "i") } },
                ],
            })
            .project("-_id author.name author.family url_code image title desc publishedAt")
            .sort({ publishedAt: "desc" });

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

export default NotificationController;
