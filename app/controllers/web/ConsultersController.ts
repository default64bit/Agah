import { Request, Response } from "express";
import moment from "moment";
import Admin from "../../models/Admin";
import AdminRole from "../../models/AdminRole";
import Schedule from "../../models/Schedule";
import TimeOffSchedule from "../../models/TimeOffSchedule";
import BookedSchedule from "../../models/BookedSchedule";

class Controller {
    public async getConsulters(req: Request, res: Response) {
        const role = await AdminRole.model.findOne({ name: "Consulter" }).exec();
        const consulters = await Admin.model
            .find({ role: role._id })
            .select("-password -status -googleID -role -createdAt")
            .exec();

        res.json(consulters);
    }

    public async getSchedule(req: Request, res: Response) {
        const id = req.params.id;

        const consulter = await Admin.model
            .findById(id)
            .select("-password -status -googleID -role -createdAt -email -desc -mobile -socialMedias")
            .exec();
        const schedules = await Schedule.model.find({ admin: id }).exec();
        const timeOffSchedules = await TimeOffSchedule.model.find({ admin: id }).exec();

        const schedulesByDay = [];
        schedules.forEach((item) => {
            if (!schedulesByDay[item.dayName]) schedulesByDay[item.dayName] = {};
            if (!schedulesByDay[item.dayName][item.type]) schedulesByDay[item.dayName][item.type] = [];
            schedulesByDay[item.dayName][item.type].push({ startTime: item.startTime, endTime: item.endTime });
        });

        const dates = {};

        let startDate = moment(Date.now()).add(1, "day");
        let endDate = moment(Date.now()).add(30, "days");

        const bookedSchedules = await BookedSchedule.model
            .find({
                consulter: id,
                dateRaw: {
                    $gte: new Date(startDate.format("yyyy-MM-DD")),
                    $lte: new Date(endDate.format("yyyy-MM-DD")),
                },
                $and: [{ status: { $ne: "finished" } }, { status: { $ne: "canceled" } }],
            })
            .exec();

        while (startDate < endDate) {
            if (!!schedulesByDay[startDate.format("ddd").toLowerCase()]) {
                let isOffDay = false;
                let offReason = "";
                for (let i = 0; i < timeOffSchedules.length; i++) {
                    if (moment(timeOffSchedules[i].startDate) < startDate && startDate < moment(timeOffSchedules[i].endDate)) {
                        isOffDay = true;
                        offReason = "timeOff";
                        break;
                    }
                }
                if (!isOffDay) {
                    // TODO
                    // send request to check the day
                }

                let onlineHours = [];
                let inPersonHours = [];
                if (!isOffDay) {
                    // also for each hour check if someone booked it or not
                    schedulesByDay[startDate.format("ddd").toLowerCase()]["online"].forEach((hour) => {
                        const time = moment(`2020-09-12 ${hour.startTime}`);
                        do {
                            onlineHours.push(time.format("HH:mm"));
                            time.add(1, "hour");
                        } while (time <= moment(`2020-09-12 ${hour.endTime}`));
                    });
                    schedulesByDay[startDate.format("ddd").toLowerCase()]["in-person"].forEach((hour) => {
                        const time = moment(`2020-09-12 ${hour.startTime}`);
                        do {
                            inPersonHours.push(time.format("HH:mm"));
                            time.add(1, "hour");
                        } while (time <= moment(`2020-09-12 ${hour.endTime}`));
                    });

                    inPersonHours = [...new Set(inPersonHours)];
                    onlineHours = [...new Set(onlineHours)];

                    bookedSchedules.forEach((bookedSchedule) => {
                        if (startDate.format("yyyy-MM-DD") == bookedSchedule.date) {
                            if (onlineHours.indexOf(bookedSchedule.time) !== -1) onlineHours.splice(onlineHours.indexOf(bookedSchedule.time), 1);
                            if (inPersonHours.indexOf(bookedSchedule.time) !== -1) inPersonHours.splice(inPersonHours.indexOf(bookedSchedule.time), 1);
                        }
                    });
                }

                dates[startDate.toISOString()] = {
                    offReason: offReason,
                    isOffDay: isOffDay,
                    online: onlineHours,
                    "in-person": inPersonHours,
                };
            }
            startDate.add(1, "day");
        }

        res.json({ consulter, dates, bookedSchedules });
    }
}

export default Controller;
