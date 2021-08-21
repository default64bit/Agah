import mongoose from "mongoose";
import mongodb from "mongodb";
import bcrypt from "bcrypt";

const _schema: mongoose.Schema = new mongoose.Schema(
    {
        image: {
            type: String,
            get: (image) => {
                if (image) return image;
                return "http://localhost:3000/img/avatars/admin.png";
            },
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
        googleID: {
            type: String,
        },
        status: {
            type: String,
            default: "active",
            enum: ["active", "deactive", "banned"],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
_schema.virtual("organizations", {
    ref: "user_organizations",
    localField: "_id",
    foreignField: "user",
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
