import fs from "fs/promises";
import { Request, Response } from "express";
import mongoose from "mongoose";
import sharp from "sharp";
import randStr from "../../helpers/randStr";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import adminPermissionCheck from "../../helpers/adminPermissionCheck";
import Article from "../../models/Article";

class AdminRolesController {
    public async getArticles(req: AuthenticatedRequest, res: Response) {
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
            case "بازدیدها":
                sort = "views";
                break;
            case "وضعیت":
                sort = "status";
                break;
            case "تاریخ انتشار":
                sort = "publishedAt";
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
                    { "author.name": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { "author.family": { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { title: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { desc: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { text: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { tags: { $regex: new RegExp(`.*${search}.*`, "i") } },
                    { status: { $regex: new RegExp(`.*${search}.*`, "i") } },
                ],
            });
        data = data.project("author.name author.family image title desc views status publishedAt createdAt");

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

    public async getArticle(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.params.id ? req.params.id : 0;

        // finding the model
        const article = await Article.model
            .findById(id)
            .populate("author", ["image", "name", "family"])
            .exec();
        if (!article) return res.status(404).end();

        return res.json(article);
    }

    public async uploadImage(req: AuthenticatedRequest, res: Response) {
        if (!req.file) return;

        const tempName = req.params.temp;
        const ogName = req.file.originalname;
        const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);

        if (req.file.size > 2097152) {
            fs.unlink(req.file.path);
            return res.status(422).json({ success: 0, error: "Image file must be under 2MB" });
        }

        let isMimeOk = extension == "png" || extension == "gif" || extension == "jpeg" || extension == "jpg";
        if (!isMimeOk) {
            fs.unlink(req.file.path);
            return res.status(422).json({ error: "Image file must .jpg, .png or .gif" });
        }

        // make a folder by the temp name
        const tempFolderExists = await fs
            .access(`public/articles/${tempName}`)
            .then(() => true)
            .catch(() => false);
        if (!tempFolderExists || (tempFolderExists && !(await fs.stat(`public/articles/${tempName}`)).isDirectory())) {
            await fs.mkdir(`public/articles/${tempName}`);
        }

        const name = randStr(30);

        // optimize the image
        let sharpifiedImage = sharp(await fs.readFile(req.file.path));
        if ((await sharpifiedImage.metadata()).width >= 1024) {
            sharpifiedImage = sharpifiedImage.resize(1024);
        }

        // move the file to correct folder
        fs.unlink(req.file.path);
        const isCopied = await sharpifiedImage.toFile(`public/articles/${tempName}/${name}.${extension}`).catch((e) => {
            console.log(e);
            return false;
        });
        if (!isCopied) return res.status(500).end();

        const url = `${req.headers.origin}/img/articles/${tempName}/${name}.${extension}`;

        return res.json({
            success: 1,
            file: {
                url: url,
                name: `${name}.${extension}`,
                base_path: "img/articles/",
            },
        });
    }

    public async addArticle(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        // use sharp for making the main image size smaller and make athumbnail
        if (!req.file) return res.status(422).json({ error: "select an image for the article" });
        const ogName = req.file.originalname;
        const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);
        if (req.file.size > 2097152) {
            fs.unlink(req.file.path);
            return res.status(422).json({ error: "Image file must be under 2MB" });
        }
        let isMimeOk = extension == "png" || extension == "gif" || extension == "jpeg" || extension == "jpg";
        if (!isMimeOk) {
            fs.unlink(req.file.path);
            return res.status(422).json({ error: "Image file must .jpg, .png or .gif" });
        }
        const imageName = randStr(30);
        const imageBuffer = await fs.readFile(req.file.path);
        // optimize the image
        let sharpifiedImage = sharp(imageBuffer);
        let sharpifiedImageThumbnail = sharp(imageBuffer).resize(400);
        if ((await sharpifiedImage.metadata()).width >= 1024) sharpifiedImage = sharpifiedImage.resize(1024);
        // move the file to correct folder
        const isCopied = await sharpifiedImage.toFile(`public/articles/${imageName}.${extension}`).catch(() => false);
        const isCopiedThumnail = await sharpifiedImageThumbnail.toFile(`public/articles/${imageName}_thumbnail.${extension}`).catch(() => false);
        fs.unlink(req.file.path);
        if (!isCopied || !isCopiedThumnail) return res.status(500).end();
        const imageUrl = `${req.headers.origin}/img/articles/${imageName}.${extension}`;
        const imageThumbnailUrl = `${req.headers.origin}/img/articles/${imageName}_thumbnail.${extension}`;

        const title = req.body.title;
        const desc = req.body.desc;
        const status = req.body.status;
        const tags = JSON.parse(req.body.tags);
        const metaDesc = req.body.metaDesc;
        const metaTags = req.body.metaTags;
        const text = req.body.text;

        const lastArticle = await Article.model.findOne().sort({url_code:'desc'}).exec();
        const url_code = parseInt(lastArticle.url_code) + 1;

        const article = await Article.model
            .create({
                author: req.admin._id,
                image: imageUrl,
                title: title,
                desc: desc,
                text: text,
                tags: tags,
                metadata: {
                    thumbnail: imageThumbnailUrl,
                    title: title,
                    description: metaDesc,
                    author: `${req.admin.name} ${req.admin.family}`,
                    keywords: metaTags,
                },
                status: status,
                url_code: url_code,
                publishedAt: status == "published" ? new Date(Date.now()) : null,
            })
            .then((doc) => doc)
            .catch((e) => {
                console.log(e);
            });
        if (!article) return res.status(500).end();

        // rename the temp folder for article
        const tempName = req.body.tempAddr;
        await fs.rename(`public/articles/${tempName}/`, `public/articles/${article._id}`);

        // rename the image links in article text
        let existingImages = [];
        const textJson = JSON.parse(req.body.text);
        await textJson.blocks.map((block) => {
            if (block.type == "imageTool") {
                block.data.file.url = block.data.file.url.replace(tempName, article._id);
                existingImages.push(block.data.file.url.split("/").pop());
            }
        });
        // remove any unused image in article folder
        const articleImages = await fs.readdir(`public/articles/${article._id}`);
        articleImages.forEach(async (image) => {
            if (!existingImages.includes(image)) await fs.unlink(`public/articles/${article._id}/${image}`);
        });

        await Article.model.updateOne({ _id: article._id }, { text: JSON.stringify(textJson) }).exec();

        return res.json(article);
    }

    public async editArticle(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        const id = req.body.id;
        const article = await Article.model.findById(req.body.id).exec();
        if (!article) {
            if (req.file) fs.unlink(req.file.path);
            return res.status(404).json({
                error: "admin does not exists",
            });
        }

        // use sharp for making the main image size smaller and make athumbnail
        let imageUrl = article.image;
        let imageThumbnailUrl = article.metadata.thumbnail;
        if (req.file) {
            const ogName = req.file.originalname;
            const extension = ogName.slice(((ogName.lastIndexOf(".") - 1) >>> 0) + 2);
            if (req.file.size > 2097152) {
                fs.unlink(req.file.path);
                return res.status(422).json({ error: "Image file must be under 2MB" });
            }
            let isMimeOk = extension == "png" || extension == "gif" || extension == "jpeg" || extension == "jpg";
            if (!isMimeOk) {
                fs.unlink(req.file.path);
                return res.status(422).json({ error: "Image file must .jpg, .png or .gif" });
            }
            const imageName = randStr(30);
            const imageBuffer = await fs.readFile(req.file.path);
            // optimize the image
            let sharpifiedImage = sharp(imageBuffer);
            let sharpifiedImageThumbnail = sharp(imageBuffer).resize(400);
            if ((await sharpifiedImage.metadata()).width >= 1024) sharpifiedImage = sharpifiedImage.resize(1024);
            // move the file to correct folder
            const isCopied = await sharpifiedImage.toFile(`public/articles/${imageName}.${extension}`).catch(() => false);
            const isCopiedThumnail = await sharpifiedImageThumbnail.toFile(`public/articles/${imageName}_thumbnail.${extension}`).catch(() => false);
            fs.unlink(req.file.path);
            if (!isCopied || !isCopiedThumnail) return res.status(500).end();
            imageUrl = `${req.headers.origin}/img/articles/${imageName}.${extension}`;
            imageThumbnailUrl = `${req.headers.origin}/img/articles/${imageName}_thumbnail.${extension}`;
        }

        const title = req.body.title;
        const desc = req.body.desc;
        const status = req.body.status;
        const tags = JSON.parse(req.body.tags);
        const metaDesc = req.body.metaDesc;
        const metaTags = req.body.metaTags;
        const text = req.body.text;

        const articleUpdated = await Article.model
            .updateOne(
                { _id: article._id },
                {
                    image: imageUrl,
                    title: title,
                    desc: desc,
                    text: text,
                    tags: tags,
                    metadata: {
                        thumbnail: imageThumbnailUrl,
                        title: title,
                        description: metaDesc,
                        author: article.metadata.author,
                        keywords: metaTags,
                    },
                    status: status,
                    publishedAt: status == "published" && article.status == "pending" ? new Date(Date.now()) : article.publishedAt,
                }
            )
            .exec();
        if (!articleUpdated) return res.status(500).end();

        // rename the image links in article text
        let existingImages = [];
        const textJson = JSON.parse(req.body.text);
        textJson.blocks.forEach((block) => {
            if (block.type == "imageTool") existingImages.push(block.data.file.url.split("/").pop());
        });

        try{
            // remove any unused image in article folder
            const articleImages = await fs.readdir(`public/articles/${article._id}`);
            articleImages.forEach(async (image) => {
                if (!existingImages.includes(image)) await fs.unlink(`public/articles/${article._id}/${image}`);
            });
        }catch(e){}

        return res.end();
    }

    public async deleteArticle(req: AuthenticatedRequest, res: Response) {
        if (!adminPermissionCheck(req, req.admin)) return res.status(403).end();

        let id = mongoose.Types.ObjectId(req.params.id);

        // finding the model
        const role = await Article.model.findByIdAndDelete(id).exec();
        if (!role) return res.status(404).end();

        return res.json(role);
    }
}

export default AdminRolesController;
