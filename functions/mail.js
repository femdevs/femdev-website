const nodemailer = require('nodemailer');
require('dotenv').config();

class Mail {
    constructor() {
        this.transporter = nodemailer.createTransport({
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            host: "stmp.forwardemail.net",
            port: 465,
            secure: true,
        }, {
            from: process.env.MAIL_FROM,
            replyTo: process.env.MAIL_REPLYTO,
            sender: {
                name: process.env.MAIL_SENDER_NAME,
            }
        });
    }
    sendEmail(to, subject, content, type) {
        this.transporter.sendMail({
            encoding: 'utf-8',
            textEncoding: 'base64',
            envelope: {
                from: this.transporter.options.from,
                to: to,
            },
            to: to,
            subject: subject,
            [(type === 'text/plain') ? 'text' : 'html']: content,
        });
    }
}

module.exports = Mail;