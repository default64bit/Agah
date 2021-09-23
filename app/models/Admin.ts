import mongoose from "mongoose";
import mongodb from "mongodb";
import bcrypt from "bcrypt";

const _schema: mongoose.Schema = new mongoose.Schema({
    image: {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    family: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    desc: {
        type: String,
    },
    mobile: {
        type: String,
    },
    socialMedias: [
        new mongoose.Schema({
            name: { type: String },
            link: { type: String },
        }),
    ],
    consultPricePerHour: { // in Toman
        type: Number,
        default: 100000
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "active",
        enum: ["active", "deactive"],
    },
    googleID: {
        type: String,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin_roles",
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

export interface IAdmin {
    _id: mongodb.ObjectId;
    image: string;
    name: string;
    family: string;
    email: string;
    desc: string;
    mobile: string;
    socialMedias: Array<ISocialMedia>;
    consultPricePerHour: number;
    password: string;
    status: string;
    googleID: string;
    role: mongoose.Types.ObjectId;
    createdAt: Date;
}
export interface ISocialMedia {
    _id: mongodb.ObjectId;
    name: string;
    link: string;
}

class Admin {
    public static model = mongoose.model<IAdmin>("admins", _schema);

    public static async hash(rawPass: string): Promise<string> {
        return await bcrypt.hash(rawPass, 5);
    }
    public static async checkPass(hashPass: string, rawPass: string): Promise<boolean> {
        return await bcrypt.compare(rawPass, hashPass);
    }
}

export default Admin;
