import mongoose from "mongoose";
import mongodb from "mongodb";

const _schema: mongoose.Schema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
    },
    message: {
        type: String,
    },
    readAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    deletedAt: {
        type: Date,
    },
});

export interface IAdminChatMessages {
    _id: mongodb.ObjectId;
    sender: mongodb.ObjectId;
    receiver: mongodb.ObjectId;
    message: string;
    readAt: Date;
    createdAt: Date;
    deletedAt: Date;
}

class AdminChatMessages {
    public static model = mongoose.model<IAdminChatMessages>("admin_chat_messages", _schema);
}

export default AdminChatMessages;
