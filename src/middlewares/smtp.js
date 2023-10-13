const nodemailer = require("nodemailer");
import env from "../configs/env.json";

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
      console.log(err);
    } else {
      console.log("Email sent:");
    }
  });
};
