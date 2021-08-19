import { Request, Response } from "express";
import mongoose from "mongoose";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import AdminChatMessages from "../../models/AdminChatMessages";
import AdminChat from "../../models/AdminChat";
import Admin from "../../models/Admin";

class MessageBoardController {
    public async getChats(req: AuthenticatedRequest, res: Response) {
        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = 25;
        let peoples = [];

        const chats = await AdminChat.model
            .find({ $or: [{ userOne: req.admin._id }, { userTwo: req.admin._id }] })
            .populate("userOne", ["image", "email", "name", "family"])
            .populate("userTwo", ["image", "email", "name", "family"])
            .sort({
                lastMessageDate: "desc",
            })
            .limit(pp)
            .skip((page - 1) * pp)
            .exec();

        for (let i = 0; i < chats.length; i++) {
            let chat = chats[i];
            let admin = null;
            admin = chat.userOne.equals(req.admin._id) ? chat.userTwo : chat.userOne;

            const hasNew = await AdminChatMessages.model.exists({
                readAt: { $exists: false },
                receiver: req.admin._id,
                sender: admin.id,
            });

            peoples.push({
                id: admin.id,
                email: admin.email,
                avatar: admin.image,
                fullName: `${admin.name} ${admin.family}`,
                lastMsg: chat.lastMessage,
                hasNew: hasNew,
            });
        }

        res.json(peoples);
    }

    public async getMessages(req: AuthenticatedRequest, res: Response) {
        const userId = req.query.userId ? mongoose.Types.ObjectId(req.query.userId.toString()) : "";
        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = 50;

        const messages = await AdminChatMessages.model
            .find({
                $or: [
                    { sender: req.admin._id, receiver: userId },
                    { sender: userId, receiver: req.admin._id },
                ],
            })
            .populate("sender", ["image", "email", "name", "family"])
            .populate("receiver", ["image", "email", "name", "family"])
            .sort({
                createdAt: "desc",
            })
            .limit(pp)
            .skip((page - 1) * pp)
            .exec();

        messages.reverse();
        return res.json(messages);
    }

    public async getPeoples(req: AuthenticatedRequest, res: Response) {
        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = 25;

        const admins = await Admin.model
            .find({ _id: { $ne: req.admin._id } })
            .select(["image", "name", "family", "email"])
            .limit(pp)
            .skip((page - 1) * pp)
            .exec();

        let adminsList = admins.map((admin) => {
            return {
                id: admin.id,
                email: admin.email,
                avatar: admin.image,
                fullName: `${admin.name} ${admin.family}`,
            };
        });

        res.json(adminsList);
    }
}

export default MessageBoardController;
