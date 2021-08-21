import mongoose from "mongoose";
import mongodb from "mongodb";

const _schema: mongoose.Schema = new mongoose.Schema({
    offer: {
        type: mongoose.Schema.Types.Mixed,
    },
    offerCandidate: {
        type: mongoose.Schema.Types.Mixed,
    },
    answer: {
        type: mongoose.Schema.Types.Mixed,
    },
    answerCandidate: {
        type: mongoose.Schema.Types.Mixed,
    },
    callerType: {
        type: String,
        enum: ["admins", "users"],
    },
    caller: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "caller_type",
    },
    calleeType: {
        type: String,
        enum: ["admins", "users"],
    },
    callee: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "callee_type",
    },
    startedAt: {
        type: Date,
    },
    endedAt: {
        type: Date,
    },
    duration: {
        type: Number, // in seconds
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

export interface ICall {
    _id: mongodb.ObjectId;
    offer: any;
    offerCandidate: any;
    answer: any;
    answerCandidate: any;
    callerType: string;
    caller: mongodb.ObjectId;
    calleeType: string;
    callee: mongodb.ObjectId;
    duration: number;
    startedAt: Date;
    createdAt: Date;
}

class Call {
    public static model = mongoose.model<ICall>("calls", _schema);
}

export default Call;
