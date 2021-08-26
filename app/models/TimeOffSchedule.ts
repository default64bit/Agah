import mongoose from "mongoose";
import mongodb from "mongodb";

const _schema: mongoose.Schema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

export interface ITimeOffSchedule {
    _id: mongodb.ObjectId;
    admin: mongodb.ObjectId;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
}

class TimeOffSchedule {
    public static model = mongoose.model<ITimeOffSchedule>("time_off_schedules", _schema);
}

export default TimeOffSchedule;
