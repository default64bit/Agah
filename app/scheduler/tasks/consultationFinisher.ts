import { CronJob } from "cron";

// TODO
// make cron-job to change the status of payed bookedSchedules to finished if their time is passed more than the duration... every 1min
export const ConsultationFinisher = new CronJob("0 */1 * * * *", () => {
    try {
        // get all the todays booked schedules
        // combine the date and time and compare to the Date.now() + duration
        // if it's passed the time then mark it as finished
    } catch (error) {
        // log the error
    }
});
