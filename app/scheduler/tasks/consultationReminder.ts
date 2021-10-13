import { CronJob } from "cron";

// TODO
// make cron-job to inform user when the consultation session time is near... every 1hour
export const UserConsultationReminder = new CronJob("0 */60 * * * *", () => {
    try {
        // get all todays active and payed booked schedule that the time is less current time
        // recheck the time to make sure that it's less than an hour from current time
        // check if user received any notifs of this kind in the pass hour
        // notify the user via in system and email
    } catch (error) {
        // log the error
    }
});

// TODO
// make cron-job to inform admin of their todays booked schedules... every 24hour
export const AdminConsultationReminder = new CronJob("0 0 0 */1 * *", () => {
    try {
        // get all current booked schedules for today
        // group them for each admin
        // notify admin with the list of times and types and user's names of booked schedules
    } catch (error) {
        // log the error
    }
});