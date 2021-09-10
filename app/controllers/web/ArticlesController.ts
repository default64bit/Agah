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
}

export default NotificationController;
