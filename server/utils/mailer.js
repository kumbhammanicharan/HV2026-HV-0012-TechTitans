const nodemailer = require('nodemailer');
const path = require('path');

// Always load the .env file from the server folder
require('dotenv').config({
    path: path.resolve(__dirname, '../.env'),
});

const emailUser = process.env.EMAIL_USER;
const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

if (!emailUser || !emailPass) {
    console.warn(
        '⚠️ EMAIL_USER or EMAIL_PASS is missing. Email notifications are disabled.'
    );
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

async function sendResolutionEmail(to, subject, text) {
    if (!emailUser || !emailPass) {
        throw new Error(
            'Email is not configured. Add EMAIL_USER and EMAIL_PASS to server/.env.'
        );
    }

    if (!to) {
        throw new Error(
            'Recipient email address is required.'
        );
    }

    return transporter.sendMail({
        from: `"CampusCare" <${emailUser}>`,
        to,
        subject,
        text,
    });
}

module.exports = {
    sendResolutionEmail,
};