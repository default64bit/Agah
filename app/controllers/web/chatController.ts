import { Request, Response } from "express";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import UserChat from "../../models/UserChat";
import UserChatMessages from "../../models/UserChatMessages";

class Controller {
    public async getChats(req: AuthenticatedRequest, res: Response) {
        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = 25;
        let peoples = [];

        const chats = await UserChat.model
            .find({ user: req.user._id })
            .populate("consulter", ["image", "name", "family"])
            .sort({ lastMessageDate: "desc" })
            .limit(pp)
            .skip((page - 1) * pp)
            .exec();

        for (let i = 0; i < chats.length; i++) {
            let chat = chats[i];

            const hasNew = await UserChatMessages.model.exists({
                readAt: { $exists: false },
                receiver: req.user._id,
                sender: chat.consulter._id,
            });

            peoples.push({
                id: chat._id,
                receiver: chat.consulter._id,
                image: chat.consulter.image,
                fullName: `${chat.consulter.name} ${chat.consulter.family}`,
                lastMsg: chat.lastMessage,
                hasNew: hasNew,
            });
        }

        res.json(peoples);
    }

    public async getChatMessages(req: AuthenticatedRequest, res: Response) {
        const chatId = req.params.id;
        const page = req.query.page ? parseInt(req.query.page.toString()) : 1;
        const pp = 50;

        const chat = await UserChat.model.findOne({ _id: chatId, user: req.user._id }).exec();
        if (!chat) return res.status(404).json({ error: "پیامی وجود ندارد" });

        const messages = await UserChatMessages.model
            .find({
                $or: [
                    { sender: chat.user, receiver: chat.consulter },
                    { sender: chat.consulter, receiver: chat.user },
                ],
            })
            .select("sender receiver message file readAt createdAt")
            .sort({ createdAt: "desc" })
            .limit(pp)
            .skip((page - 1) * pp)
            .exec();

        messages.reverse();
        return res.json(messages);
    }

    public async uploadAttachment(req: AuthenticatedRequest, res: Response) {
        // TODO : upload attachment
    }
}

export default Controller;
