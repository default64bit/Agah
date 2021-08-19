import { Router } from "express";
import adminAuth from "../middlewares/adminAuth";
import AuthenticatedRequest from "../interfaces/AuthenticatedRequest";
import AdminChatMessages from "../models/AdminChatMessages";
import AdminChat from "../models/AdminChat";

const router = Router();
router.use(adminAuth.ensureAuth);

interface msgObj {
    event: string;
    data: any;
}

let sockets = {};
router.ws("/ISM", (socket, req: AuthenticatedRequest) => {
    // TODO : refactor
    sockets[req.admin.email] = socket;

    socket.on("message", async (ws) => {
        let msg: msgObj = JSON.parse(ws.toString());
        switch (msg.event) {
            case "startTyping":
                if (!msg.data.userId || !msg.data.email) break;
                // send a startTypingCB event to reciver if he/she is online
                if (sockets[msg.data.email]) {
                    sockets[msg.data.email].send(
                        JSON.stringify({
                            event: "startTypingCB",
                            userId: req.admin._id,
                            userEmail: req.admin.email,
                        })
                    );
                }
                break;
            case "stopTyping":
                if (!msg.data.userId || !msg.data.email) break;
                // send a stopTypingCB event to reciver if he/she is online
                if (sockets[msg.data.email]) {
                    sockets[msg.data.email].send(
                        JSON.stringify({
                            event: "stopTypingCB",
                            userId: req.admin._id,
                            userEmail: req.admin.email,
                        })
                    );
                }
                break;
            case "message":
                if (!msg.data.userId || !msg.data.email) break;

                let message = await AdminChatMessages.model.create({
                    sender: req.admin._id,
                    receiver: msg.data.userId,
                    message: msg.data.message,
                });
                message = await AdminChatMessages.model
                    .findById(message.id)
                    .populate("sender", ["image", "email", "name", "family"])
                    .populate("receiver", ["image", "email", "name", "family"])
                    .exec();

                // update the lastMessage and lastMessageDate in chat
                await AdminChat.model
                    .updateOne(
                        {
                            $or: [
                                { userOne: req.admin._id, userTwo: msg.data.userId },
                                { userOne: msg.data.userId, userTwo: req.admin._id },
                            ],
                        },
                        {
                            userOne: req.admin._id,
                            userTwo: msg.data.userId,
                            lastMessage: message,
                            lastMessageDate: message.createdAt,
                        },
                        { upsert: true }
                    )
                    .exec();

                // send the message to sender and reciver if he/she is online
                if (sockets[msg.data.email]) {
                    sockets[msg.data.email].send(
                        JSON.stringify({
                            event: "messageCB",
                            message,
                        })
                    );
                }
                if (sockets[req.admin.email]) {
                    sockets[req.admin.email].send(
                        JSON.stringify({
                            event: "messageCB",
                            message,
                        })
                    );
                }

                break;
            case "seen":
                if (!msg.data.userId || !msg.data.email) break;

                // set the readAt of all chat messages that the user is the reciver to date().now
                const now = new Date(Date.now());
                await AdminChatMessages.model
                    .updateMany(
                        {
                            sender: msg.data.userId,
                            receiver: req.admin._id,
                            readAt: { $exists: false },
                        },
                        {
                            readAt: now,
                        }
                    )
                    .exec();

                // send request to let senders know the messages are seen
                if (sockets[msg.data.email]) {
                    sockets[msg.data.email].send(
                        JSON.stringify({
                            event: "seenCB",
                            userId: req.admin._id,
                            userEmail: req.admin.email,
                            callerEmail: req.admin.email,
                            time: now,
                        })
                    );
                }
                if (sockets[req.admin.email]) {
                    sockets[req.admin.email].send(
                        JSON.stringify({
                            event: "seenCB",
                            userId: msg.data.userId,
                            userEmail: msg.data.email,
                            callerEmail: req.admin.email,
                            time: now,
                        })
                    );
                }

                break;
        }
    });

    socket.on("close", (ws) => {
        delete sockets[req.admin.email];
    });
});

export default router;
