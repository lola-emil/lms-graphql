import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { BUSINESS_NAME, MAILER_ADDRESS, MAILER_PASSWORD } from "../config/constants";
import Logger from "./logger";
import Handlebars from "handlebars";

import fs from "fs";
import path from "path";

const templatePath = path.join(__dirname, "../../assets/templates");

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

const transporter = nodemailer.createTransport(config);

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
        html: content.html,
    });

    Logger.success(`Message sent: ${info.messageId}`);

    return info;
}

function readTemplate(filePath: string) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(templatePath, filePath), { encoding: "utf-8" }, (error, data) => {
            if (error) return reject(error);
            return resolve(data);
        });
    });
}

export async function mailCredentials(receiverAddress: string, data: Partial<{
    name: string;
    email: string;
    password: string;
    business: string;
}>) {
    const templateSrc = await readTemplate("password.hbs");
    const template = Handlebars.compile(templateSrc);

    const result = template(data);

    await sendMail(receiverAddress, {
        subject: "Credentials",
        html: result
    });
}