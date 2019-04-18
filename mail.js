
const nodemailer = require('nodemailer');
require('dotenv').config();

async function main({ token, email }) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: 'antonyansergey2002@gmail.com', // sender address
    to: email, // list of receivers
    subject: 'Waves Verification', // Subject line
    text: token, // plain text body
    html: `<a href="http://localhost:7000/user/verify/${token}">http://localhost:7000/user/verify/${token}</a>`, // html body
  });

  console.log('Message sent: %s', info.messageId);

  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

module.exports.main = main;
