import { CronJob } from "cron";
import moment from "moment";
import BookedSchedule from "../../models/BookedSchedule";

// make cron-job to remove/cancel any wainting-for-payment bookings after 15min passed from the records creation... every 1min
export const UnpaidConsultationCleaner = new CronJob("0 */1 * * * *", async () => {
    try {
        const time = moment(Date.now())
            .subtract("15", "minutes")
            .toISOString();
        await BookedSchedule.model
            .updateMany(
                {
                    status: "waiting-for-payment",
                    "transaction.status": { $ne: "ok" },
                    createdAt: { $lte: new Date(time) },
                },
                { status: "canceled" }
            )
            .exec();
    } catch (error) {
        // log the error
    }
});
