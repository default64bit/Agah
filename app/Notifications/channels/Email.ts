import nodemailer from "nodemailer";

export default async (subject: string, receivers: string, html) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE == "true" ? true : false, // true for 465, false for other ports (587)
        logger: true,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `گروه وکلای آگه <${process.env.MAIL_USERNAME}>`,
        to: receivers, // list of receivers in string
        subject: subject,
        // text: "Hello world", // plain text body
        html: html,
    });
};
