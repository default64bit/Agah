import fs from "fs/promises";
import { Request, Response } from "express";
import { getPayload } from "./authHelper";
import AdminRole from "../models/AdminRole";
import Admin from "../models/Admin";
import Article from "../models/Article";
import Faq from "../models/Faq";

async function import_articles(json) {
    const role = await AdminRole.model.findOne({ name: "Consulter" }).exec();
    const admins = await Admin.model
        .find({ role: role._id })
        .limit(2)
        .exec();

    const last_article = await Article.model
        .findOne()
        .sort({ url_code: "desc" })
        .exec();
    let last_url_code = !!last_article ? parseInt(last_article.url_code) + 1 : 1;

    const articles = [];
    for (let i = 0; i < json.length; i++) {
        const image = json[i].metadatas.image.replace("_thumbnail", "");
        articles.push({
            author: json[i].lawyer_id == "1" ? admins[0] : admins[1],
            image: `/img/articles/${image}`,
            title: json[i].title,
            desc: json[i].sub_text,
            text: json[i].text,
            tags: json[i].tags,
            metadata: {
                thumbnail: `/img/articles/${json[i].metadatas.image}`,
                title: json[i].metadatas.title,
                description: json[i].metadatas.description,
                author: json[i].metadatas.author,
                keywords: json[i].metadatas.keywords,
            },
            views: json[i].view_count,
            status: json[i].status == "PUBLISHED" ? "published" : "pending",
            url_code: last_url_code,
            publishedAt: new Date(json[i].updated_at),
            createdAt: new Date(json[i].created_at),
        });
        last_url_code++;
    }
    await Article.model.insertMany(articles);
}

async function import_faqs(json) {
    const role = await AdminRole.model.findOne({ name: "Consulter" }).exec();
    const admins = await Admin.model
        .find({ role: role._id })
        .limit(2)
        .exec();

    const faqs = [];
    for (let i = 0; i < json.length; i++) {
        faqs.push({
            author: json[i].lawyer_id == "1" ? admins[0] : admins[1],
            question: json[i].question,
            answer: json[i].answer,
            status: json[i].disabled == "0" ? "published" : "pending",
            createdAt: new Date(json[i].created_at),
        });
    }
    await Faq.model.insertMany(faqs);
}

export default async (req: Request, res: Response) => {
    let adminID = getPayload(req, "AdminAuthToken", process.env.JWT_SECRET);
    if (!adminID) return res.status(401).end();

    const admin = await Admin.model.findById(adminID);
    if (!admin) return res.status(401).end();

    const filename = req.params.filename;
    await fs
        .readFile(`public/${filename}`, { encoding: "utf-8" })
        .then(async (content) => {
            // import it
            const json = JSON.parse(content);
            switch (filename) {
                case "articles.db.json":
                    await import_articles(json);
                    break;
                case "faqs.db.json":
                    await import_faqs(json);
                    break;
            }
            res.end();
        })
        .catch((e) => {
            console.log(e);
            // res.end(e);
        });
    return;
};
