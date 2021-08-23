import mongoose from "mongoose";
import mongodb from "mongodb";
import UserChatMessages, { IUserChatMessages } from "./UserChatMessages";

const _schema: mongoose.Schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
    },
    lastMessage: {
        type: UserChatMessages.prototype,
    },
    lastMessageDate: {
        type: Date,
    },
});

export interface IUserChat {
    _id: mongodb.ObjectId;
    user: mongodb.ObjectId;
    admin: mongodb.ObjectId;
    lastMessage: IUserChatMessages;
    lastMessageDate: Date;
}

class UserChat {
    public static model = mongoose.model<IUserChat>("user_chats", _schema);
}

export default UserChat;
