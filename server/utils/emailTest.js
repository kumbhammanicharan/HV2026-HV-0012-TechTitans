const nodemailer = require('nodemailer');
const path = require('path');

// Load server/.env reliably
require('dotenv').config({
    path: path.resolve(__dirname, '../.env'),
});

async function sendTestEmail() {
    try {
        const emailUser = process.env.EMAIL_USER;

        // Remove spaces from Google App Password
        const emailPass = (
            process.env.EMAIL_PASS || ''
        ).replace(/\s+/g, '');

        const emailTo = process.env.EMAIL_TO;

        if (!emailUser || !emailPass || !emailTo) {
            throw new Error(
                'Set EMAIL_USER, EMAIL_PASS and EMAIL_TO in server/.env before running this test.'
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

        // Verify Gmail SMTP connection first
        await transporter.verify();

        console.log(
            '✅ Gmail SMTP connection verified.'
        );

        const info = await transporter.sendMail({
            from: `"CampusCare" <${emailUser}>`,
            to: emailTo,
            subject: 'Test Email from CampusCare',
            text: `Hello,

This is a test email from the CampusCare Smart Campus Complaint System.

If you received this message, Gmail SMTP and Nodemailer are configured correctly.

CampusCare Team`,
        });

        console.log(
            '✅ Test email sent successfully!'
        );

        console.log(
            'Message ID:',
            info.messageId
        );

    } catch (error) {
        console.error(
            '❌ Email test failed:',
            error.message
        );
    }
}

sendTestEmail();