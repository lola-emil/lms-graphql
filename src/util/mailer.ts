import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { BUSINESS_NAME, MAILER_ADDRESS, MAILER_PASSWORD } from "../config/constants";
import Logger from "./logger";


const config: SMTPTransport.Options = {
    host: 'smtp.gmail.com',
    service: "gmail",
    port: 587,
    secure: false, // use false for STARTTLS; true for SSL on port 465
    auth: {
        user: MAILER_ADDRESS,
        pass: MAILER_PASSWORD,
    }
};

export const transporter = nodemailer.createTransport(config);

export async function sendMail(receiverAddress: string, content: {
    subject?: string;
    text?: string;
    html?: string;
}) {
    const info = await transporter.sendMail({
        from: `${BUSINESS_NAME} <${MAILER_ADDRESS}>`,
        subject: content.subject,
        to: receiverAddress,
        text: content.text,
        html: content.html
    });

    Logger.success(`Message sent: ${info.messageId}`);

    return info;
}
