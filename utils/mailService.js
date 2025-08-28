const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail", // or "Outlook", "Yahoo", custom SMTP
  auth: {
    user: process.env.GMAIL_USER, // your email
    pass: process.env.GMAIL_PASS  // app password
  }
});

exports.sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: `"BTC Careers" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html
  };

  return transporter.sendMail(mailOptions);
};
