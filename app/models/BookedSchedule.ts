import mongoose from "mongoose";
import mongodb from "mongodb";

const _schema: mongoose.Schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
        required: true,
    },
    date: {
        type: Date,
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
            type: Number, // in Toman
        },
        transactionCode: { type: String },
        identifier: { type: String },
        status: {
            type: String,
            enum: ["ok", "failed", "canceled"],
            required: true,
        },
        error: { type: String },
        ip: {
            type: String,
            required: true,
        },
    }),
    status: {
        type: String,
        enum: ["waiting-for-payment", "payed", "canceled"],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

export interface IBookedSchedule {
    _id: mongodb.ObjectId;
    user: mongodb.ObjectId;
    admin: mongodb.ObjectId;
    date: Date;
    time: string;
    duration: number;
    type: string;
    transaction: ITransaction;
    status: string;
    createdAt: Date;
}
export interface ITransaction {
    amount: number;
    payedAmount: number;
    transactionCode: string;
    identifier: string;
    status: string;
    error: string;
    ip: string;
}

class BookedSchedule {
    public static model = mongoose.model<IBookedSchedule>("booked_schedules", _schema);
}

export default BookedSchedule;
