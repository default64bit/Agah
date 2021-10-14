import { CronJob } from "cron";
import moment from "moment";
import BookedSchedule from "../../models/BookedSchedule";

// make cron-job to change the status of payed bookedSchedules to finished if their time is passed more than the duration... every 1min
export const ConsultationFinisher = new CronJob("0 */1 * * * *", async () => {
    try {
        // get all the todays booked schedules
        const bookedSchedules = await BookedSchedule.model
            .find({
                status: "payed",
                date: moment(Date.now()).format("yyyy-MM-DD"),
                time: { $lte: moment(Date.now()).format("HH:mm") },
            })
            .exec();

        for (let i = 0; i < bookedSchedules.length; i++) {
            let bookedTime = moment(`${bookedSchedules[i].date} ${bookedSchedules[i].time}`);
            let timeDiff = moment.duration(moment(Date.now()).diff(bookedTime));
            if (timeDiff.asMinutes() > bookedSchedules[i].duration * 60) {
                // if it's passed the time then mark it as finished
                await BookedSchedule.model.updateOne({ _id: bookedSchedules[i]._id }, { status: "finished" });
            }
        }
    } catch (error) {
        // log the error
    }
});
