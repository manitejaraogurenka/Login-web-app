import nodemailer from "nodemailer";
import Mailgen from "mailgen";

import ENV from "../config.js";

// https://ethereal.email/create
let nodeConfig = {
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: ENV.EMAIL,
    pass: ENV.PASSWORD,
  },
};

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js",
  },
});

/*POST: http://localhost:8080/api/registerMail*/
export const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  // body of the email
  var email = {
    body: {
      name: username,
      intro: text || "Hallo there! I am very excited to have you on board",
      outro: "Need help, or have queries? Just reply to this email...",
    },
  };
  var eamilBody = MailGenerator.generate(email);

  let message = {
    from: ENV.EMAIL,
    to: userEmail,
    subject: subject || "Signup Successful",
    html: eamilBody,
  };
  // send mail
  transporter
    .sendMail(message)
    .then(() => {
      return res.status(200).send({
        msg: "You should receive an email from us!",
      });
    })
    .catch((error) => res.status(500).send({ error }));
};
