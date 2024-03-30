const nodemailer = require('nodemailer');
require('dotenv').config();

class Mail {
    constructor() {
        this.transporter = nodemailer.createTransport({
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            host: "smtp.forwardemail.net",
            port: 465,
            secure: true,
        });
    }
    /** @param {string} to @param {string} subject @param {string} content */
    sendEmail(to, subject, content) {
        this.transporter.sendMail({
            encoding: 'utf-8',
            textEncoding: 'base64',
            envelope: {
                from: {
                    name: process.env.MAIL_SENDER_NAME,
                    address: process.env.MAIL_FROM,
                },
                to: to,
            },
            from: {
                name: process.env.MAIL_SENDER_NAME,
                address: process.env.MAIL_FROM,
            },
            sender: {
                name: process.env.MAIL_SENDER_NAME,
                address: process.env.MAIL_FROM,
            },
            replyTo: process.env.MAIL_REPLY_TO,
            to: to,
            subject: subject,
            [(content.startsWith('<')) ? 'html' : 'text']: content,
        });
    }
}

module.exports = Mail;