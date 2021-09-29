import { Router, Request } from "express";
import moment from "moment";
import mongodb from "mongodb";
import AuthenticatedRequest from "../interfaces/AuthenticatedRequest";
import { getPayload } from "../helpers/authHelper";
import WebSocket from "ws";
import Call from "../models/Call";
import UserChatMessages from "../models/UserChatMessages";
import UserChat from "../models/UserChat";
import User from "../models/User";
import Admin from "../models/Admin";
import BookedSchedule from "../models/BookedSchedule";

const router = Router();

interface msgObj {
    event: string;
    data: any;
}

interface Person {
    _id: mongodb.ObjectId;
    image: string;
    name: string;
    family: string;
    email: string;
}

let ISC_users: Object = {};
let ISC_admins: Object = {};
router.ws("/ISC", (socket: WebSocket, req: AuthenticatedRequest) => {
    // TODO
    // check if req.user or req.admin exists
    // if not then do nothing

    console.log(`ISC connect: ${req.user._id.toHexString()}`);

    ISC_users[req.user._id.toHexString()] = socket;
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
                if (!ISC_users.hasOwnProperty(msg.data.userToCall)) {
                    socket.send(JSON.stringify({ event: "userNotOnline" }));
                    return;
                }
                // make call record and save offerCandidates
                let newCall = await Call.model
                    .create({ offer: msg.data.offer, callerType: "users", caller: req.user._id, calleeType: "users", callee: msg.data.userToCall })
                    .then((call) => call);

                ISC_users[msg.data.userToCall].send(
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
                if (ISC_users.hasOwnProperty(msg.data.userToCall)) {
                    ISC_users[msg.data.userToCall].send(
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
                if (!ISC_users.hasOwnProperty(msg.data.callerId)) return;
                // update answer in DB
                await Call.model.updateOne({ _id: msg.data.callId }, { answer: msg.data.answer, startedAt: new Date(Date.now()) }).exec();
                ISC_users[msg.data.callerId].send(JSON.stringify({ event: "callerAnswerUpdate", callId: msg.data.callId, answer: msg.data.answer }));
                break;
            case "updateCallAnswerCandidates":
                // update answerCandidate in DB
                await Call.model.updateOne({ _id: msg.data.callId }, { answerCandidate: msg.data.answerCandidates }).exec();
                ISC_users[msg.data.callerId].send(
                    JSON.stringify({ event: "callerAnswerCandidateUpdate", callId: msg.data.callId, answerCandidates: msg.data.answerCandidates })
                );
                break;

            case "calleeIsBusy":
                if (!ISC_users.hasOwnProperty(msg.data.callerId)) return;
                ISC_users[msg.data.callerId].send(JSON.stringify({ event: "calleeIsBusy" }));
                break;
            case "callRejected":
                if (ISC_users.hasOwnProperty(msg.data.callerId)) ISC_users[msg.data.callerId].send(JSON.stringify({ event: "callRejected" }));
                break;
            case "hungupCall":
                // get call from db and send caller and callee the hungupCall msg
                if (!msg.data.callId) return;
                let call = await Call.model.findOne({ _id: msg.data.callId }).exec();
                if (call) {
                    if (ISC_users.hasOwnProperty(call.caller.toHexString())) ISC_users[call.caller.toHexString()].send(JSON.stringify({ event: "hungupCall" }));
                    if (ISC_users.hasOwnProperty(call.callee.toHexString())) ISC_users[call.callee.toHexString()].send(JSON.stringify({ event: "hungupCall" }));
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
        if (ISC_users.hasOwnProperty(req.user._id.toHexString())) {
            delete ISC_users[req.user._id.toHexString()];
            console.log(`ISC disconnected: ${req.user._id.toHexString()}`);
        }
    });
});

let ISM_sockets = {
    users: {},
    admins: {},
};
// let ISM_users: Object = {};
// let ISM_admins: Object = {};
router.ws("/ISM", async (socket: WebSocket, req: Request) => {
    let person: Person;
    let senderType = "";
    let receiverType = "";

    let userID = getPayload(req, "UserAuthToken", process.env.JWT_SECRET);
    let adminID = getPayload(req, "AdminAuthToken", process.env.JWT_SECRET);

    // check if req.user or req.admin exists
    if (!!adminID) {
        let admin = (person = await Admin.model.findById(adminID));
        if (admin) ISM_sockets.admins[admin._id] = socket;
        senderType = "admins";
        receiverType = "users";
    } else if (!!userID) {
        let user = (person = await User.model.findById(userID));
        if (user) ISM_sockets.users[user._id] = socket;
        senderType = "users";
        receiverType = "admins";
    } else return;

    socket.on("message", async (ws) => {
        let msg: msgObj = JSON.parse(ws.toString());
        switch (msg.event) {
            case "startTyping":
                if (!msg.data.chatId || !msg.data.receiverId) break;
                // send a startTypingCB event to reciver if he/she is online
                if (ISM_sockets[receiverType][msg.data.receiverId]) {
                    ISM_sockets[receiverType][msg.data.receiverId].send(
                        JSON.stringify({
                            event: "startTypingCB",
                            chatId: msg.data.chatId,
                        })
                    );
                }
                break;
            case "stopTyping":
                if (!msg.data.chatId || !msg.data.receiverId) break;
                // send a stopTypingCB event to reciver if he/she is online
                if (ISM_sockets[receiverType][msg.data.receiverId]) {
                    ISM_sockets[receiverType][msg.data.receiverId].send(
                        JSON.stringify({
                            event: "stopTypingCB",
                            chatId: msg.data.chatId,
                        })
                    );
                }
                break;
            case "message":
                if (!msg.data.chatId || !msg.data.receiverId || !msg.data.message) break;

                // check that user is in it's booked time with this consulter/receiver
                if (senderType == "users") {
                    let canSendMessage = false;
                    const bookedSchedules = await BookedSchedule.model
                        .find({
                            user: person._id,
                            consulter: msg.data.receiverId,
                            type: "online",
                            status: "payed",
                            date: moment(Date.now()).format("yyyy-MM-DD"),
                        })
                        .exec();
                    for (let i = 0; i < bookedSchedules.length; i++) {
                        // check if current time is in between of schedule time and schedule time + duration
                        let bookedTime = moment(`${bookedSchedules[i].date} ${bookedSchedules[i].time}`);
                        let timeDiff = moment.duration(moment(Date.now()).diff(bookedTime));
                        if (0 < timeDiff.asMinutes() && timeDiff.asMinutes() < bookedSchedules[i].duration * 60) canSendMessage = true;
                    }
                    if (!canSendMessage) {
                        // send a stopCB to sender
                        if (ISM_sockets[senderType][person._id.toHexString()]) {
                            ISM_sockets[senderType][person._id.toHexString()].send(JSON.stringify({ event: "stopCB", chatId: msg.data.chatId }));
                        }
                        break;
                    }
                }

                let message = await UserChatMessages.model.create({
                    sender: person._id,
                    senderType: senderType,
                    receiver: msg.data.receiverId,
                    receiverType: receiverType,
                    message: msg.data.message,
                });
                message = await UserChatMessages.model
                    .findById(message.id)
                    .select("sender receiver message file readAt createdAt")
                    .exec();

                // update the lastMessage and lastMessageDate in chat
                await UserChat.model
                    .updateOne(
                        {
                            $or: [
                                { user: person._id, consulter: msg.data.receiverId },
                                { user: msg.data.receiverId, consulter: person._id },
                            ],
                        },
                        {
                            user: person._id,
                            consulter: msg.data.receiverId,
                            lastMessage: message,
                            lastMessageDate: message.createdAt,
                        },
                        { upsert: true }
                    )
                    .exec();

                // send the message to sender and reciver if he/she is online
                if (ISM_sockets[receiverType][msg.data.receiverId]) {
                    ISM_sockets[receiverType][msg.data.receiverId].send(JSON.stringify({ event: "messageCB", chatId: msg.data.chatId, message }));
                }
                if (ISM_sockets[senderType][person._id]) {
                    ISM_sockets[senderType][person._id].send(JSON.stringify({ event: "messageCB", chatId: msg.data.chatId, message }));
                }

                break;
            case "seen":
                if (!msg.data.chatId || !msg.data.receiverId) break;

                // set the readAt of all chat messages that the user is the reciver to date().now
                const now = new Date(Date.now());
                await UserChatMessages.model
                    .updateMany({ sender: msg.data.receiverId, receiver: person._id, readAt: { $exists: false } }, { readAt: now })
                    .exec();

                // send request to let senders know the messages are seen
                if (ISM_sockets[receiverType][msg.data.receiverId]) {
                    ISM_sockets[receiverType][msg.data.receiverId].send(
                        JSON.stringify({
                            event: "seenCB",
                            otherUserId: person._id,
                            senderId: person._id,
                            time: now,
                        })
                    );
                }
                if (ISM_sockets[senderType][person._id]) {
                    ISM_sockets[senderType][person._id].send(
                        JSON.stringify({
                            event: "seenCB",
                            otherUserId: msg.data.receiverId,
                            senderId: person._id,
                            time: now,
                        })
                    );
                }

                break;
        }
    });

    socket.on("close", (ws) => {
        delete ISM_sockets[senderType][person._id];
    });
});

export default router;
