import mongoose from "mongoose";
import mongodb from "mongodb";

const _schema: mongoose.Schema = new mongoose.Schema({
    template: {
        type: String,
        required: true,
        default: "DefaultNotifTemplate",
    },
    modelType: {
        type: String,
        required: true,
        enum: ["admins", "users"],
    },
    model: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "model_type",
    },
    data: {
        type: Object,
    },
    readAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

export interface INotification {
    _id: mongodb.ObjectId;
    template: string;
    modelType: string;
    model: mongodb.ObjectId;
    data: object;
    readAt: Date;
    createdAt: Date;
}

class Notification {
    public static model = mongoose.model<INotification>("notifications", _schema);
}

export default Notification;