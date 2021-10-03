import { Request, Response } from "express";
import axios from "axios";
import moment from "moment";
import AuthenticatedRequest from "../../interfaces/AuthenticatedRequest";
import User from "../../models/User";
import Admin from "../../models/Admin";
import Schedule from "../../models/Schedule";
import TimeOffSchedule from "../../models/TimeOffSchedule";
import BookedSchedule from "../../models/BookedSchedule";
import UserChat from "../../models/UserChat";
import UserChatMessages from "../../models/UserChatMessages";
import { PaymentGateway } from "../../payments/paymentGateway";

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
            if (schedule.startTime <= time && time <= schedule.endTime) {
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

        // TODO
        // limit user to max 2 active consultation resserves only

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

        // send a request to gateway and get the identifier
        const paymentGateway = new PaymentGateway("pay_ir");
        let identifier = await paymentGateway.getIdentifier(
            paymentGateway.getApiKey(),
            consulter.consultPricePerHour,
            `${process.env.PROTOCOL}://${process.env.DOMAIN}/api/v1/web/book/callback`,
            "هزینه مشاوره",
            user.mobile
        );

        if (identifier != "") {
            // create a booking record
            await BookedSchedule.model.create({
                user: user._id,
                consulter: consulter._id,
                dateRaw: new Date(moment(date).format("yyyy-MM-DD")),
                date: moment(date).format("yyyy-MM-DD"),
                time: time,
                duration: 1,
                type: type,
                transaction: {
                    amount: consulter.consultPricePerHour,
                    payedAmount: 0,
                    identifier: identifier,
                    method: paymentGateway.getMethod(),
                    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || null,
                },
            });
            // send back the identifier
            return res.json({ url: paymentGateway.getGatewayUrl(identifier) });
        } else return res.status(422).json({ error: "خطا در ارتباط با درگاه پرداخت" });
    }

    public async bookConsultationSessionCallback(req: Request, res: Response) {
        let paymentStatus = 0;
        let message = "";

        const paymentGateway = new PaymentGateway("pay_ir");
        const transactionResponse = paymentGateway.getTransactionResponse(req);

        const bookedSchedule = await BookedSchedule.model.findOne({ "transaction.identifier": transactionResponse.identifier }).exec();

        if (transactionResponse.status == "OK") {
            // send a request to pay.ir to verify the transaction
            await paymentGateway
                .verify(paymentGateway.getApiKey(), transactionResponse.identifier, { amount: bookedSchedule.transaction.amount })
                .then(async (response) => {
                    // if transaction verified correctly then you will get a transactionCode
                    const transactionCode = response.transactionCode;
                    // check if there is no transactionCode same as this new one
                    const doesTransactionCodeExists = await BookedSchedule.model.exists({ "transaction.transactionCode": transactionCode });
                    if (!doesTransactionCodeExists) {
                        // if there is none then update the booked schedule record status and transaction data
                        await BookedSchedule.model.updateOne(
                            { "transaction.identifier": transactionResponse.identifier },
                            {
                                status: "payed",
                                "transaction.payedAmount": bookedSchedule.transaction.amount * 10,
                                "transaction.transactionCode": response.transactionCode,
                                "transaction.status": "ok",
                            }
                        );

                        // also make a chat record from the consulter to user so that user can see the consulter in their chat page
                        if (bookedSchedule.type == "online") {
                            const doesChatExists = await UserChat.model.exists({ user: bookedSchedule.user, consulter: bookedSchedule.consulter });
                            if (!doesChatExists) {
                                await UserChat.model.create({
                                    user: bookedSchedule.user,
                                    consulter: bookedSchedule.consulter,
                                    lastMessageDate: new Date(Date.now()),
                                    newMessage: 1,
                                });
                                await UserChatMessages.model.create({
                                    senderType: "admins",
                                    sender: bookedSchedule.consulter,
                                    receiverType: "users",
                                    receiver: bookedSchedule.user,
                                    message: "سلام، با تشکر از رزرو وقت مشاوره، لطفا در تاریخ و ساعت مشخص شده به همین قسمت مراجعه کنید.",
                                });
                            }
                        }

                        paymentStatus = 1;
                        message = "مشاوره در تاریخ و زمان مورد نظر برای شما رزرو شد.";
                    } else {
                        // if there is one that means user is triyng to buy twice: inform the user that service is booked already
                        paymentStatus = -1;
                        message = "مشاوره برای شما از قبلا رزرو شده.";
                    }
                })
                .catch(async (error) => {
                    // if verfication failed then inform the user that transaction failed and payed amount will be back to their bank card
                    paymentStatus = -2;
                    message = "تراکنش به درستی انجام نشد. مبلغ پرداخت شده تا چند ساعت دیگر به حساب شما واریز میشود.";
                    // change the booked record status and save error
                    await BookedSchedule.model.updateOne(
                        { "transaction.identifier": transactionResponse.identifier },
                        { status: "canceled", "transaction.status": "failed", "transaction.error": error.response || null }
                    );
                });
        } else {
            // if status is not 1 then some error accured
            // eather user canceled the payment or something
            paymentStatus = -3;
            message = "تراکنش لغو شد.";
            // cancel the booked record and change its status and save the error
            await BookedSchedule.model.updateOne(
                { "transaction.identifier": transactionResponse.identifier },
                { status: "canceled", "transaction.status": "canceled" }
            );
        }

        // redirect to users profile page and Toast or print the result of payment and errors if any
        res.cookie("PaymentResults", JSON.stringify({ status: paymentStatus, message: message }), { sameSite: "lax", path: "/", maxAge: 60000 });
        return res.redirect("/profile");
    }
}

export default Controller;
