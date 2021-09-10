import mongoose from "mongoose";
import mongodb from "mongodb";

const _schema: mongoose.Schema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "admins" },
    question: { type: String },
    answer: { type: String },
    status: { type: String, enum: ["published", "pending"] },
    createdAt: { type: Date, default: Date.now() },
});

export interface IFaq {
    _id: mongodb.ObjectId;
    author: mongodb.ObjectId;
    question: string;
    answer: string;
    status: string;
    createdAt: Date;
}

class Faq {
    public static model = mongoose.model<IFaq>("faqs", _schema);
}

export default Faq;
