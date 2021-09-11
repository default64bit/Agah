import nodemailer from "nodemailer";

export default async (subject: string, receivers: string, html) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: process.env.MAIL_SECURE, // true for 465, false for other ports (587)
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: "گروه وکلای آگه <info@agah-lawyers.com>",
        to: receivers, // list of receivers in string
        subject: subject,
        // text: "Hello world", // plain text body
        html: html,
    });
};
