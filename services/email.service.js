import nodemailer from 'nodemailer';

// TODO: REMOVE BEFORE PRODUCTION!
const EMAIL_CONFIG = {
  user: 'anaofficialproduct@gmail.com',      // Replace with your Gmail
  pass: 'raak ydyi hihx kxni' // Replace with your app password
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_CONFIG.user,
    pass: EMAIL_CONFIG.pass
  }
});

export const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: `"Beauty Shop" <${EMAIL_CONFIG.user}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
