const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: options.email,
    subject: options.subject,
  };

  if (options.html) {
    mailOptions.html = options.html;
    mailOptions.text = options.message || undefined;
  } else {
    mailOptions.text = options.message;
  }

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
