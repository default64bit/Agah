import { Request, Response } from "express";
import axios from "axios";
import moment from "moment";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import User from "../../models/User";
import Admin from "../../models/Admin";
import Schedule from "../../models/Schedule";
import TimeOffSchedule from "../../models/TimeOffSchedule";
import BookedSchedule from "../../models/BookedSchedule";

class Controller {
    public async bookConsultationSession(req: AuthenticatedRequest, res: Response) {
        const user = await User.model.findById(req.user._id).exec();

        const consulter_id = req.body.consulter;
        const date = req.body.date;
        const time = req.body.time;
        const type = req.body.type;

        const dayName = moment(date)
            .format("ddd")
            .toLowerCase();

        const consulter = await Admin.model.findById(consulter_id).exec();

        // check if the time is in consulter schedule
        let notInSchedule = false;
        const schedules = await Schedule.model.find({ admin: consulter_id, type: type, dayName: dayName }).exec();
        schedules.forEach((schedule) => {
            if (schedule.startTime < time && time < schedule.endTime) {
            } else notInSchedule = true;
        });
        if (notInSchedule) return res.status(422).json({ error: "زمان و تاریخ انتخاب شده برای این مشاور وجود ندارد" });

        // check if the time is not in off day of consulter
        const timeOffSchedules = await TimeOffSchedule.model.find({ admin: consulter_id }).exec();
        for (let i = 0; i < timeOffSchedules.length; i++) {
            if (moment(timeOffSchedules[i].startDate) < moment(date) && moment(date) < moment(timeOffSchedules[i].endDate)) {
                return res.status(422).json({ error: "زمان و تاریخ انتخاب شده برای این مشاور وجود ندارد" });
            }
        }

        // TODO
        // check if the time is not holiday

        // check if anyone is booked this time before or not
        const isBookedBefore = await BookedSchedule.model.exists({
            consulter: consulter._id,
            date: moment(date).format("yyyy-MM-DD"),
            time: time,
            status: { $ne: "canceled" },
        });
        if (isBookedBefore) return res.status(422).json({ error: "زمان و تاریخ انتخابی شما توسط شخص دیگری رزرو شد." });

        // check if this user has any unpayed booked session and make them canceled
        await BookedSchedule.model.updateMany({ user: req.user._id, status: "waiting-for-payment" }, { status: "canceled" }).exec();

        // send a request to pay.ir and get the identifier
        let identifier = "";
        await axios
            .post("https://pay.ir/pg/send", {
                api: process.env.PAY_IR_KEY,
                amount: consulter.consultPricePerHour * 10,
                redirect: `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/v1/web/book/callback`,
                description: "هزینه مشاوره",
                mobile: user.mobile,
            })
            .then((response) => {
                if (response.data.status == 1 && response.data.token) {
                    identifier = response.data.token;
                }
            })
            .catch((error) => {
                // TODO : log the error in logger
            });

        if (identifier != "") {
            // create a booking record
            await BookedSchedule.model.create({
                user: user._id,
                consulter: consulter._id,
                date: moment(date).format("yyyy-MM-DD"),
                time: time,
                duration: 1,
                type: type,
                transaction: {
                    amount: consulter.consultPricePerHour,
                    payedAmount: 0,
                    identifier: identifier,
                    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
                },
            });
            // send back the identifier
            return res.json({ identifier });
        } else return res.status(422).json({ error: "خطا در ارتباط با درگاه پرداخت" });
    }

    public async bookConsultationSessionCallback(req: Request, res: Response) {
        const status = req.query.status;
        const token = req.query.token;

        if (status == "1") {
            // send a request to pay.ir to verify the transaction
            axios
                .post("https://pay.ir/pg/verify", {
                    api: process.env.PAY_IR_KEY,
                    token: token,
                })
                .then(async (response) => {
                    // if transaction verified correctly then you will get a transactionCode
                    const transactionCode = response.data.transId;
                    // check if there is no transactionCode same as this new one
                    const doesTransactionCodeExists = await BookedSchedule.model.exists({ "transaction.transactionCode": transactionCode });
                    if (!doesTransactionCodeExists) {
                        // if there is none then update the booked schedule record status and transaction data
                        await BookedSchedule.model.updateOne(
                            { "transaction.identifier": token },
                            {
                                status: "payed",
                                "transaction.payedAmount": response.data.amount,
                                "transaction.transactionCode": response.data.transId,
                                "transaction.status": "ok",
                            }
                        );
                    } else {
                        // TODO
                        // if there is one that means user is triyng to buy twice: inform the user that service is booked already
                    }
                })
                .catch(async (error) => {
                    // TODO
                    // if verfication failed then inform the user that transaction failed and payed amount will be back to their bank card

                    // change the booked record status and save error
                    await BookedSchedule.model.updateOne(
                        { "transaction.identifier": token },
                        { status: "canceled", "transaction.status": "failed", "transaction.error": error.response || null }
                    );
                });
        } else {
            // if status is not 1 then some error accured
            // eather user canceled the payment or something
            // cancel the booked record and change its status and save the error
            await BookedSchedule.model.updateOne({ "transaction.identifier": token }, { status: "canceled", "transaction.status": "canceled" });
        }

        // TODO
        // redirect to users profile page and Toast or print the result of payment and errors if any
        // also make a chat record from the consulter to user so that user can see the consulter in their chat page

        return res.end();
    }
}

export default Controller;
