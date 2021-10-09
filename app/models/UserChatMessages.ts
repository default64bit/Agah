import mongoose from "mongoose";
import mongodb from "mongodb";

const _schema: mongoose.Schema = new mongoose.Schema({
    senderType: { type: String, enum: ["admins", "users"] },
    sender: { type: mongoose.Schema.Types.ObjectId, refPath: "sender_type" },

    receiverType: { type: String, enum: ["admins", "users"] },
    receiver: { type: mongoose.Schema.Types.ObjectId, refPath: "receiver_type" },

    message: { type: String },
    files: [
        new mongoose.Schema({
            name: { type: String },
            extension: { type: String },
            link: { type: String },
        }),
    ],
    readAt: { type: Date },
    deletedAt: { type: Date },
    createdAt: { type: Date, default: Date.now() },
});

export interface IUserChatMessages {
    _id: mongodb.ObjectId;
    senderType: string;
    sender: mongodb.ObjectId;
    receiverType: string;
    receiver: mongodb.ObjectId;
    message: string;
    files: Array<IFile>;
    readAt: Date;
    deletedAt: Date;
    createdAt: Date;
}
export interface IFile {
    _id: mongodb.ObjectId;
    name: string;
    extension: string;
    link: string;
}

class UserChatMessages {
    public static model = mongoose.model<IUserChatMessages>("user_chat_messages", _schema);
}

export default UserChatMessages;
