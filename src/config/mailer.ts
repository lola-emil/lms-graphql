import nodemailer from "nodemailer";
import { MAILER_ADDRESS, MAILER_PASSWORD } from "./constants";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
export function sendMail(from: string, to: string, compose: {
  subject?: string, text?: string, html?: string;
}) {
  const mailer = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service: "gmail",
    port: 587,
    secure: false, // use false for STARTTLS; true for SSL on port 465
    auth: {
      user: MAILER_ADDRESS,
      pass: MAILER_PASSWORD,
    }
  });

  mailer.sendMail({
    from,
    to,

    subject: compose.subject,
    text: compose.text,
    html: compose.html,
  });
}


export function sendAccountVerificationMail(email: string, name: string, tempPassword: string) {
  const templateSource = fs.readFileSync(path.join(__dirname, "../../assets/mail_templates/complete-registration.hbs")).toString();

  const mailTemplate = Handlebars.compile(templateSource);

  const template = mailTemplate({
    name,
    email,
    year: "2025",
    loginLink: "http://localhost:8000/verify-account",
    tempPassword
  });

  sendMail(MAILER_ADDRESS, email, {
    html: template,
    subject: "Account Verification"
  });
}