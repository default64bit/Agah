import { CronJob } from "cron";
import fs from "fs/promises";
import path from "path";
import moment from "moment";
import Email from "../../Notifications/channels/Email";
import BookedSchedule from "../../models/BookedSchedule";
import Notification from "../../models/Notification";
import NotifSender from "../../Notifications/Sender";

// make cron-job to inform user when the consultation session time is near... every 1hour
export const UserConsultationReminder = new CronJob("0 */60 * * * *", async () => {
    try {
        let rangeB = moment(Date.now())
            .add(61, "minutes")
            .format("HH:mm");
        let rangeT = moment(Date.now())
            .add(59, "minutes")
            .format("HH:mm");

        // get all todays active and payed booked schedule that the time is less current time
        const bookedSchedules = await BookedSchedule.model
            .find({
                status: "payed",
                date: moment(Date.now()).format("yyyy-MM-DD"),
                time: { $gt: moment(Date.now()).format("HH:mm") },
            })
            .populate("user", "name family")
            .populate("consulter", "name family")
            .exec();

        for (let i = 0; i < bookedSchedules.length; i++) {
            // recheck the time to make sure that it's less than an hour from current time
            if (rangeT <= bookedSchedules[i].time && bookedSchedules[i].time <= rangeB) {
                // check if user received any notifs of this kind in the pass half hour
                const lastNotif = await Notification.model
                    .findOne({ model: bookedSchedules[i].user.id, template: "ConsultationHeadsUp" })
                    .sort({ createdAt: "desc" })
                    .exec();

                if (!!lastNotif && moment.duration(moment(Date.now()).diff(lastNotif.createdAt)).asMinutes() < 30) continue;

                // notify the user via in system and email
                const consulter: any = bookedSchedules[i].consulter;
                let html = await fs
                    .readFile(path.join(__dirname, "..", "..", "Notifications", "templates", "consultationHeadsUpEmail.html"))
                    .then((buffer) => buffer.toString());
                html = html.replace(/{{url}}/g, `${process.env.PROTOCOL}://${process.env.DOMAIN}`);
                html = html.replace("{{consulter}}", `${consulter.name} ${consulter.family}`);
                NotifSender(
                    [bookedSchedules[i].user.id],
                    "users",
                    ["system", "email"],
                    "ConsultationHeadsUp",
                    {
                        icon: "fad fa-comments-alt",
                        title: "یادآوری زمان مشاوره",
                        message: `مشاوره رزرو شده شما با ${consulter.name} ${consulter.family} تا ساعاتی دیگر شروع میشود`,
                    },
                    html
                );
            }
        }
    } catch (error) {
        // log the error
        console.log(error);
    }
});

// make cron-job to inform admin of their todays booked schedules... every 24hour
export const AdminConsultationReminder = new CronJob("0 0 6 */1 * *", async () => {
    try {
        // get all current booked schedules for today
        const groupedBookedSchedules = await BookedSchedule.model
            .aggregate()
            .match({
                status: "payed",
                date: moment(Date.now()).format("yyyy-MM-DD"),
            })
            .lookup({ from: "users", localField: "user", foreignField: "_id", as: "user" })
            .lookup({ from: "admins", localField: "consulter", foreignField: "_id", as: "admin" })
            .project("admin.email user.name user.family consulter date time duration type status")
            .group({
                _id: "$consulter",
                bookedSchedules: { $push: "$$ROOT" },
            })
            .exec();

        for (let i = 0; i < groupedBookedSchedules.length; i++) {
            let adminEmail = "";
            let data = "";
            for (let j = 0; j < groupedBookedSchedules[i].bookedSchedules.length; j++) {
                let BS = groupedBookedSchedules[i].bookedSchedules[j];

                adminEmail = BS.admin[0].email;
                data += `<tr> <td>${BS.user[0].name} ${BS.user[0].family}</td> <td>ساعت ${BS.time}</td> <td>${BS.type}</td> </tr>`;
            }

            if (data != "") {
                let html = await fs
                    .readFile(path.join(__dirname, "..", "..", "Notifications", "templates", "todayBookedSchedulesForAdmin.html"))
                    .then((buffer) => buffer.toString());
                html = html.replace(/{{url}}/g, `${process.env.PROTOCOL}://${process.env.DOMAIN}`);
                html = html.replace("{{data}}", data);

                Email(`لیست مشاوره های رزرو شده برای امروز`, adminEmail, html);
            }
        }
    } catch (error) {
        // log the error
    }
});
