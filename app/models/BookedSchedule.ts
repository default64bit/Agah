import mongoose from "mongoose";
import mongodb from "mongodb";

const _schema: mongoose.Schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    consulter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
        required: true,
    },
    dateRaw: {
        type: Date,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String, // 24H -> 12:00 OR 15:43
        required: true,
    },
    duration: {
        type: Number, // in hours
        default: 1,
        required: true,
    },
    type: {
        type: String,
        enum: ["online", "in-person"],
        required: true,
    },
    transaction: new mongoose.Schema({
        amount: {
            type: Number, // in Toman
            required: true,
        },
        payedAmount: {
            type: Number, // in Rial
        },
        transactionCode: { type: String },
        identifier: { type: String },
        status: {
            type: String,
            enum: ["pending", "ok", "failed", "canceled"],
            default: "pending",
        },
        method: {
            type: String,
            enum: ["zarinpal", "pay_ir"],
        },
        error: { type: String },
        ip: {
            type: String,
            required: true,
        },
    }),
    status: {
        type: String,
        enum: ["waiting-for-payment", "payed", "finished", "canceled"],
        default: "waiting-for-payment",
    },
    uploadedFileCount: { type: Number, default: 0 },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

export interface IBookedSchedule {
    _id: mongodb.ObjectId;
    user: mongodb.ObjectId;
    consulter: mongodb.ObjectId;
    dateRaw: Date;
    date: String;
    time: string;
    duration: number;
    type: string;
    transaction: ITransaction;
    status: string;
    uploadedFileCount: number,
    createdAt: Date;
}
export interface ITransaction {
    amount: number;
    payedAmount: number;
    transactionCode: string;
    identifier: string;
    status: string;
    method: string;
    error: string;
    ip: string;
}

class BookedSchedule {
    public static model = mongoose.model<IBookedSchedule>("booked_schedules", _schema);
}

export default BookedSchedule;
