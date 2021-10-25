import mongoose from "mongoose";
import mongodb from "mongodb";
import bcrypt from "bcrypt";

const _schema: mongoose.Schema = new mongoose.Schema({
    image: {
        type: String,
        default: "/img/avatars/user.svg",
    },
    name: {
        type: String,
    },
    family: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    emailVerifiedAt: {
        type: Date,
    },
    mobile: {
        type: String,
    },
    mobileVerifiedAt: {
        type: Date,
    },
    password: {
        type: String,
        required: true,
    },
    verficationCodeSentAt: {
        type: Date,
    },
    googleID: {
        type: String,
    },
    status: {
        type: String,
        default: "deactive",
        enum: ["active", "deactive", "banned"],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

export interface IUser {
    _id: mongodb.ObjectId;
    image: string;
    name: string;
    family: string;
    email: string;
    emailVerifiedAt: Date;
    mobile: string;
    mobileVerifiedAt: Date;
    password: string;
    verficationCodeSentAt: Date;
    googleID: string;
    status: string;
    createdAt: Date;
}

class User {
    public static model = mongoose.model<IUser>("users", _schema);

    public static async hash(rawPass: string): Promise<string> {
        return await bcrypt.hash(rawPass, 5);
    }
    public static async checkPass(hashPass: string, rawPass: string): Promise<boolean> {
        return await bcrypt.compare(rawPass, hashPass);
    }
}

export default User;
