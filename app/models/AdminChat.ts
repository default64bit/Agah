import mongoose from "mongoose";
import AdminChatMessages, { IAdminChatMessages } from "./AdminChatMessages";

const _schema: mongoose.Schema = new mongoose.Schema({
    userOne: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
    },
    userTwo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
    },
    lastMessage: {
        type: AdminChatMessages.prototype,
    },
    lastMessageDate: {
        type: Date,
    },
});

export interface IAdminChat {
    _id: mongoose.Types.ObjectId;
    userOne: mongoose.Types.ObjectId;
    userTwo: mongoose.Types.ObjectId;
    lastMessage: IAdminChatMessages;
    lastMessageDate: Date;
}

class AdminChat {
    public static model = mongoose.model<IAdminChat>("admin_chats", _schema);
}

export default AdminChat;
