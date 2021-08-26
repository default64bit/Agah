import mongoose from "mongoose";
import mongodb from "mongodb";

const _schema: mongoose.Schema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
        required: true,
    },
    dayName: {
        type: String,
        enum: ["sat", "sun", "mon", "tue", "wed", "thu", "fri"],
        required: true,
    },
    startTime: {
        type: String, // 24H -> 12:00 OR 15:43
        required: true,
    },
    endTime: {
        type: String, // 24H -> 12:00 OR 15:43
        required: true,
    },
    type: {
        type: String,
        enum: ["online", "in-person"],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

export interface ISchedule {
    _id: mongodb.ObjectId;
    admin: mongodb.ObjectId;
    dayName: string;
    startTime: string;
    endTime: string;
    createdAt: Date;
}

class Schedule {
    public static model = mongoose.model<ISchedule>("schedules", _schema);
}

export default Schedule;
