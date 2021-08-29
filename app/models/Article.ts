import mongoose from "mongoose";
import mongodb from "mongodb";

const _schema: mongoose.Schema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "admins" },
    image: { type: String },
    title: { type: String, required: true },
    desc: { type: String },
    text: { type: mongoose.Schema.Types.Mixed },
    tags: [{ type: String }],
    metadata: new mongoose.Schema({
        thumbnail: { type: String },
        title: { type: String },
        description: { type: String },
        author: { type: String },
        keywords: { type: String },
    }),
    views: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "pending"] },
    url_code: { type: String, unique: true, required: true },
    publishedAt: { type: Date },
    createdAt: { type: Date, default: Date.now() },
});

export interface IArticle {
    _id: mongodb.ObjectId;
    author: mongodb.ObjectId;
    image: string;
    title: string;
    desc: string;
    text: any;
    tags: Array<string>;
    metadata: IMetadata;
    views: number;
    status: string;
    url_code: string;
    publishedAt: Date;
    createdAt: Date;
}
export interface IMetadata {
    thumbnail: string;
    title: string;
    description: string;
    author: string;
    keywords: string;
}

class Article {
    public static model = mongoose.model<IArticle>("articles", _schema);
}

export default Article;
