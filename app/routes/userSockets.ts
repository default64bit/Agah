import fs from "fs/promises";
import path from "path";
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
import Notification from "../models/Notification";
import NotifSender from "../Notifications/Sender";

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

let ISC_sockets: Object = {};
router.ws("/ISC", async (socket: WebSocket, req: Request) => {
    let person: Person;
    let personType = "";

    let userID = getPayload(req, "UserAuthToken", process.env.JWT_SECRET);
    let adminID = getPayload(req, "AdminAuthToken", process.env.JWT_SECRET);

    // check if req.user or req.admin exists
    if (!!adminID) {
        person = await Admin.model.findById(adminID);
        personType = "admins";
    } else if (!!userID) {
        person = await User.model.findById(userID);
        personType = "users";
    } else return;

    // console.log(`ISC new connection: ${personType} - ${person._id.toHexString()}`);

    ISC_sockets[person._id.toHexString()] = { personType, socket };
    socket.send(
        JSON.stringify({
            event: "uniqueId",
            id: person._id.toHexString(),
        })
    );

    socket.on("message", async (ws) => {
        let msg: msgObj = JSON.parse(ws.toString());
        switch (msg.event) {
            case "makeCall":
                // TODO #OPTIONAL
                // can check than only users can call admins and admins can call users

                if (!ISC_sockets.hasOwnProperty(msg.data.userToCall)) {
                    // check the last notif of this kind for that user|admin if its passed 1 hour send a new one
                    notify(msg.data.userToCall, person, personType, req.headers.origin, "MissedCall");
                    socket.send(JSON.stringify({ event: "userNotOnline" }));
                    return;
                }
                // make call record and save offerCandidates
                let newCall = await Call.model
                    .create({
                        offer: msg.data.offer,
                        callerType: personType,
                        caller: person._id,
                        calleeType: ISC_sockets[msg.data.userToCall].personType,
                        callee: msg.data.userToCall,
                        createdAt: new Date(Date.now()),
                    })
                    .then((call) => call);

                ISC_sockets[msg.data.userToCall].socket.send(
                    JSON.stringify({
                        event: "calleeOfferUpdate",
                        callId: newCall._id,
                        callerId: person._id,
                        caller: { name: person.name, family: person.family, image: person.image },
                        offer: msg.data.offer,
                        offerCandidates: msg.data.offerCandidates,
                    })
                );
                socket.send(JSON.stringify({ event: "updateCallId", callId: newCall._id }));

                break;
            case "updateCallOfferCandidates":
                // update offerCandidate in DB
                await Call.model.updateOne({ _id: msg.data.callId }, { offerCandidate: msg.data.offerCandidates }).exec();
                if (ISC_sockets.hasOwnProperty(msg.data.userToCall)) {
                    ISC_sockets[msg.data.userToCall].socket.send(
                        JSON.stringify({
                            event: "calleeOfferCandidateUpdate",
                            callId: msg.data.callId,
                            callerId: person._id,
                            offerCandidates: msg.data.offerCandidates,
                        })
                    );
                }
                break;
            case "answerCall":
                if (!ISC_sockets.hasOwnProperty(msg.data.callerId)) return;
                // update answer in DB
                await Call.model.updateOne({ _id: msg.data.callId }, { answer: msg.data.answer, startedAt: new Date(Date.now()) }).exec();
                ISC_sockets[msg.data.callerId].socket.send(JSON.stringify({ event: "callerAnswerUpdate", callId: msg.data.callId, answer: msg.data.answer }));
                break;
            case "updateCallAnswerCandidates":
                // update answerCandidate in DB
                await Call.model.updateOne({ _id: msg.data.callId }, { answerCandidate: msg.data.answerCandidates }).exec();
                ISC_sockets[msg.data.callerId].socket.send(
                    JSON.stringify({ event: "callerAnswerCandidateUpdate", callId: msg.data.callId, answerCandidates: msg.data.answerCandidates })
                );
                break;

            case "calleeIsBusy":
                if (!ISC_sockets.hasOwnProperty(msg.data.callerId)) return;
                ISC_sockets[msg.data.callerId].socket.send(JSON.stringify({ event: "calleeIsBusy" }));
                break;
            case "callRejected":
                if (ISC_sockets.hasOwnProperty(msg.data.callerId)) ISC_sockets[msg.data.callerId].socket.send(JSON.stringify({ event: "callRejected" }));
                break;
            case "hungupCall":
                // get call from db and send caller and callee the hungupCall msg
                if (!msg.data.callId) return;
                let call = await Call.model.findOne({ _id: msg.data.callId }).exec();
                if (call) {
                    if (ISC_sockets.hasOwnProperty(call.caller.toHexString()))
                        ISC_sockets[call.caller.toHexString()].socket.send(JSON.stringify({ event: "hungupCall" }));
                    if (ISC_sockets.hasOwnProperty(call.callee.toHexString()))
                        ISC_sockets[call.callee.toHexString()].socket.send(JSON.stringify({ event: "hungupCall" }));
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
        if (ISC_sockets.hasOwnProperty(person._id.toHexString())) {
            delete ISC_sockets[person._id.toHexString()];
            // console.log(`ISC disconnected: ${personType} - ${person._id.toHexString()}`);
        }
    });
});

let ISM_sockets = {
    users: {},
    admins: {},
};
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
                if (!msg.data.chatId || !msg.data.receiverId) break;

                // message eather should contain some text or some file
                const files = !!msg.data.files ? JSON.parse(msg.data.files) : [];
                if (!msg.data.message && !files.length) break;

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
                    message: msg.data.message || null,
                    files: files,
                    createdAt: new Date(Date.now()),
                });
                message = await UserChatMessages.model
                    .findById(message.id)
                    .select("sender receiver message files readAt createdAt")
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
                            user: senderType == "users" ? person._id : msg.data.receiverId,
                            consulter: senderType == "users" ? msg.data.receiverId : person._id,
                            lastMessage: message,
                            lastMessageDate: message.createdAt,
                        },
                        { upsert: true }
                    )
                    .exec();

                // send the message to sender and reciver if he/she is online
                if (ISM_sockets[receiverType][msg.data.receiverId]) {
                    ISM_sockets[receiverType][msg.data.receiverId].send(JSON.stringify({ event: "messageCB", chatId: msg.data.chatId, message }));
                } else {
                    // if receiver was not online then make it a notification for receiver
                    notify(msg.data.receiverId, person, senderType, req.headers.origin, "NewMessage");
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

const notify = async (userToNotify, person, personType, url, template) => {
    let emailFile = template == "MissedCall" ? "missedCallEmail.html" : "newMessageEmail.html";
    // check the last notif of this kind for that user|admin if its passed 1 hour send a new one
    const lastNotif = await Notification.model
        .findOne({ model: userToNotify, template: template })
        .sort({ createdAt: "desc" })
        .exec();
    if (!lastNotif || (!!lastNotif && moment.duration(moment(Date.now()).diff(lastNotif.createdAt)).asMinutes() > 30)) {
        let personToNotify = null;
        let personToNotifyType = personType == "users" ? "admins" : "users";
        if (personType == "users") {
            personToNotify = await Admin.model.findById(userToNotify).exec();
        } else if (personType == "admins") {
            personToNotify = await User.model.findById(userToNotify).exec();
        }

        let notifTime = new Date(Date.now()).toLocaleDateString("fa");
        let message =
            template == "MissedCall"
                ? `شما در تاریخ ${notifTime} تماس از کاربر ${person.name} ${person.family} داشته اید.`
                : `پیام جدید توسط کاربر ${person.name} ${person.family} برای شما ارسال شد.`;

        let html = await fs.readFile(path.join(__dirname, "..", "Notifications", "templates", emailFile)).then((buffer) => buffer.toString());
        html = html.replace(/{{url}}/g, url);
        html = html.replace("{{user}}", `${person.name} ${person.family}`.toString());
        html = html.replace("{{date}}", notifTime);
        NotifSender(
            [personToNotify._id],
            personToNotifyType,
            ["system", "email"],
            template,
            {
                icon: template == "MissedCall" ? "fad fa-phone-slash" : "fad fa-comment-alt-lines",
                title: template == "MissedCall" ? "تماس از دست رفته" : "پیام جدید",
                message: message,
            },
            html
        );
    }
};

export default router;
