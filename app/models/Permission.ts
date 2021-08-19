import mongoose from "mongoose";

const _schema: mongoose.Schema = new mongoose.Schema({
    _id: String,
    // name: {
    //     type: String,
    //     required: true,
    //     unique: true,
    // },
    label: {
        type: String,
        required: true,
    },
    group: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        default: "All",
        enum: ["AdminOnly", "UserOnly", "All"],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
},{

});

export interface IPermission {
    _id: string;
    // name: string;
    label: string;
    group: string;
    type: string;
    createdAt: Date;
}

class Permission {
    public static model = mongoose.model<IPermission>("permissions", _schema);
}

export default Permission;
