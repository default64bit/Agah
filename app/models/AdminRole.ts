import mongoose from "mongoose";
import { IPermission } from "./Permission";

const _schema: mongoose.Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    permissions: [
        {
            type: String,
            ref: "permissions",
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

export interface IAdminRole {
    _id: mongoose.Types.ObjectId;
    name: string;
    permissions: Array<IPermission>;
    createdAt: Date;
}

class AdminRole {
    public static model = mongoose.model<IAdminRole>("admin_roles", _schema);
}

export default AdminRole;
