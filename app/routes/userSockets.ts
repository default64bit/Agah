import { Router } from "express";
import userAuth from "../middlewares/userAuth";
import AuthenticatedRequest from "../interfaces/AuthenticatedRequest";
import moment from "moment";
import WebSocket from "ws";
import Call from "../models/Call";
import UserChatMessages from "../models/UserChatMessages";
import UserChat from "../models/UserChat";

const router = Router();
router.use(userAuth.ensureAuth);

interface msgObj {
    event: string;
    data: any;
}

let users: Object = {};
router.ws("/ISC", (socket: WebSocket, req: AuthenticatedRequest) => {
    console.log(`ISC connect: ${req.user._id.toHexString()}`);

    users[req.user._id.toHexString()] = socket;
    socket.send(
        JSON.stringify({
            event: "userUniqueId",
            id: req.user._id.toHexString(),
        })
    );

    socket.on("message", async (ws) => {
        let msg: msgObj = JSON.parse(ws.toString());
        switch (msg.event) {
            case "makeCall":
                if (!users.hasOwnProperty(msg.data.userToCall)) {
                    socket.send(JSON.stringify({ event: "userNotOnline" }));
                    return;
                }
                // make call record and save offerCandidates
                let newCall = await Call.model
                    .create({ offer: msg.data.offer, callerType: "users", caller: req.user._id, calleeType: "users", callee: msg.data.userToCall })
                    .then((call) => call);

                users[msg.data.userToCall].send(
                    JSON.stringify({
                        event: "calleeOfferUpdate",
                        callId: newCall._id,
                        callerId: req.user._id,
                        offer: msg.data.offer,
                        offerCandidates: msg.data.offerCandidates,
                    })
                );
                socket.send(JSON.stringify({ event: "updateCallId", callId: newCall._id }));

                break;
            case "updateCallOfferCandidates":
                // update offerCandidate in DB
                await Call.model.updateOne({ _id: msg.data.callId }, { offerCandidate: msg.data.offerCandidates }).exec();
                if (users.hasOwnProperty(msg.data.userToCall)) {
                    users[msg.data.userToCall].send(
                        JSON.stringify({
                            event: "calleeOfferCandidateUpdate",
                            callId: msg.data.callId,
                            callerId: req.user._id,
                            offerCandidates: msg.data.offerCandidates,
                        })
                    );
                }
                break;
            case "answerCall":
                if (!users.hasOwnProperty(msg.data.callerId)) return;
                // update answer in DB
                await Call.model.updateOne({ _id: msg.data.callId }, { answer: msg.data.answer, startedAt: new Date(Date.now()) }).exec();
                users[msg.data.callerId].send(JSON.stringify({ event: "callerAnswerUpdate", callId: msg.data.callId, answer: msg.data.answer }));
                break;
            case "updateCallAnswerCandidates":
                // update answerCandidate in DB
                await Call.model.updateOne({ _id: msg.data.callId }, { answerCandidate: msg.data.answerCandidates }).exec();
                users[msg.data.callerId].send(
                    JSON.stringify({ event: "callerAnswerCandidateUpdate", callId: msg.data.callId, answerCandidates: msg.data.answerCandidates })
                );
                break;

            case "calleeIsBusy":
                if (!users.hasOwnProperty(msg.data.callerId)) return;
                users[msg.data.callerId].send(JSON.stringify({ event: "calleeIsBusy" }));
                break;
            case "callRejected":
                if (users.hasOwnProperty(msg.data.callerId)) users[msg.data.callerId].send(JSON.stringify({ event: "callRejected" }));
                break;
            case "hungupCall":
                // get call from db and send caller and callee the hungupCall msg
                if (!msg.data.callId) return;
                let call = await Call.model.findOne({ _id: msg.data.callId }).exec();
                if (call) {
                    if (users.hasOwnProperty(call.caller.toHexString())) users[call.caller.toHexString()].send(JSON.stringify({ event: "hungupCall" }));
                    if (users.hasOwnProperty(call.callee.toHexString())) users[call.callee.toHexString()].send(JSON.stringify({ event: "hungupCall" }));
                    // record the call duration
                    let startedAt = moment(call.startedAt);
                    let endedAt = moment(new Date());
                    let duration = moment.duration(startedAt.diff(endedAt));
                    await Call.model.updateOne({ _id: msg.data.callId }, { endedAt: endedAt, duration: Math.ceil(Math.abs(duration.asSeconds())) }).exec();
                }
                break;
        }
    });

    socket.on("close", (ws) => {
        if (users.hasOwnProperty(req.user._id.toHexString())) {
            delete users[req.user._id.toHexString()];
            console.log(`ISC disconnected: ${req.user._id.toHexString()}`);
        }
    });
});

let sockets = {};
router.ws("/ISM", (socket: WebSocket, req: AuthenticatedRequest) => {
    sockets[req.user.email] = socket;

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
                            userId: req.user._id,
                            userEmail: req.user.email,
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
                            userId: req.user._id,
                            userEmail: req.user.email,
                        })
                    );
                }
                break;
            case "message":
                if (!msg.data.userId || !msg.data.email) break;

                let message = await UserChatMessages.model.create({
                    sender: req.user._id,
                    receiver: msg.data.userId,
                    message: msg.data.message,
                });
                message = await UserChatMessages.model
                    .findById(message.id)
                    .populate("sender", ["image", "email", "name", "family"])
                    .populate("receiver", ["image", "email", "name", "family"])
                    .exec();

                // update the lastMessage and lastMessageDate in chat
                await UserChat.model
                    .updateOne(
                        {
                            $or: [
                                { userOne: req.user._id, userTwo: msg.data.userId },
                                { userOne: msg.data.userId, userTwo: req.user._id },
                            ],
                        },
                        {
                            userOne: req.user._id,
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
                if (sockets[req.user.email]) {
                    sockets[req.user.email].send(
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
                await UserChatMessages.model
                    .updateMany(
                        {
                            sender: msg.data.userId,
                            receiver: req.user._id,
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
                            userId: req.user._id,
                            userEmail: req.user.email,
                            callerEmail: req.user.email,
                            time: now,
                        })
                    );
                }
                if (sockets[req.user.email]) {
                    sockets[req.user.email].send(
                        JSON.stringify({
                            event: "seenCB",
                            userId: msg.data.userId,
                            userEmail: msg.data.email,
                            callerEmail: req.user.email,
                            time: now,
                        })
                    );
                }

                break;
        }
    });

    socket.on("close", (ws) => {
        delete sockets[req.user.email];
    });
});

export default router;
