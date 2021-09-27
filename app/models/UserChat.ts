import mongoose from "mongoose";
import mongodb from "mongodb";
import UserChatMessages, { IUserChatMessages } from "./UserChatMessages";
import { IAdmin } from "./Admin";

const _schema: mongoose.Schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    consulter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
    },
    lastMessage: {
        type: UserChatMessages.prototype,
    },
    lastMessageDate: {
        type: Date,
    },
    newMessage: {
        type: Number,
        default: 0,
    },
});

export interface IUserChat {
    _id: mongodb.ObjectId;
    user: mongodb.ObjectId;
    consulter: IAdmin;
    lastMessage: IUserChatMessages;
    lastMessageDate: Date;
    newMessage: Number;
}

class UserChat {
    public static model = mongoose.model<IUserChat>("user_chats", _schema);
}

export default UserChat;
