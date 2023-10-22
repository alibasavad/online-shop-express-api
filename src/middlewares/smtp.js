const nodemailer = require("nodemailer");
import env from "../configs/env.json";
import { AppError } from "../handlers/error-handler";

const transporter = nodemailer.createTransport({
  port: env.SMTP_PORT,
  host: env.SMTP_HOST,
  auth: {
    user: env.EMAIL,
    pass: env.PASSWORD,
  },
});

export const sendEmailConfirmation = (confirmationCode, email) => {
  const mailOption = {
    from: env.EMAIL, // sender address
    to: email, // list of receivers
    subject: "Confirmation Code", // Subject line
    text: `This is Your Confirmation Code : ${confirmationCode}`, // plain text body
  };

  transporter.sendMail(mailOption, (err, info) => {
    if (err) {
      throw new AppError(324);
    } else {
      console.log("Email sent:");
    }
  });
};

export const sendTemporaryPassword = (temporaryPass, email) => {
  const mailOption = {
    from: env.EMAIL, // sender address
    to: email, // list of receivers
    subject: "New Password", // Subject line
    text: `This is Your Temporary Password : ${temporaryPass}`, // plain text body
  };

  transporter.sendMail(mailOption, (err, info) => {
    if (err) {
      throw new AppError(324);
    } else {
      console.log("Email sent:");
    }
  });
};
