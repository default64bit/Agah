import mongoose from "mongoose";
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
    _id: mongoose.Types.ObjectId;
    image: string;
    name: string;
    family: string;
    email: string;
    password: string;
    status: string;
    googleID: string;
    role: mongoose.Types.ObjectId;
    createdAt: Date;
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
