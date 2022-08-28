import { Request, Response } from "express";
import Article from "../../models/Article";

class Controller {
    public async getRandomArticles(req: Request, res: Response) {
        const articlesCount = await Article.model.countDocuments({ status: "published" }).exec();

        const randomArticles = [];
        for (let i = 0; i < 5; i++) {
            let random = Math.floor(Math.random() * articlesCount);
            const article = await Article.model
                .findOne({ status: "published" })
                .skip(random)
                .select("author image title desc url_code publishedAt metadata")
                .populate("author", "image name family -_id")
                .exec();
            if (article) randomArticles.push(article);
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
            .project("-_id author.name author.family url_code image metadata title desc publishedAt")
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

    public async getArticle(req: Request, res: Response) {
        let url_code = '';
        try {
            // url_code = parseInt(req.query.url_code.toString());
            url_code = req.query.url_code.toString();
        } catch (e) {}

        const article = await Article.model
            .findOne({ url_code: url_code, status: "published" })
            .select("-_id -views -status -createdAt")
            .populate("author", "image name family -_id")
            .exec();
        if (!article) return res.status(404).json({ error: "مطلب پیدا نشد" });

        await Article.model.updateOne({ url_code: url_code, status: "published" }, { $inc: { views: 1 } }).exec();

        const similarArticles = await Article.model
            .find({ status: "published", tags: { $in: article.tags }, id: { $ne: article._id } })
            .select("-_id -views -status -createdAt")
            .populate("author", "image name family -_id")
            .limit(3)
            .exec();

        res.json({
            article: article,
            similarArticles: similarArticles,
        });
    }

    public async getArticleMeta(req: Request, res: Response) {
        let url_code = 0;
        try {
            url_code = parseInt(req.query.url_code.toString());
        } catch (e) {}

        const article = await Article.model
            .findOne({ url_code: url_code })
            .select("metadata")
            .exec();

        res.json({
            thumbnail: article.metadata.thumbnail,
            title: article.metadata.title,
            description: article.metadata.description,
            author: article.metadata.author,
            keywords: article.metadata.keywords,
        });
    }
}

export default Controller;
