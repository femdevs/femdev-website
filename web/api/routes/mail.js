const router = require('express').Router();
const Auth = require('../../../functions/crypto');
const User = require('../../../functions/userMgr');
const htmlProcessor = require('node-html-parser');
const nodemailer = require('nodemailer');

/** @param {string} @returns {Promise<string>} */
const getBody = async (body) => {
    if (body.text) return body.text;
    if (body.html) return body.html;
    if (body.url) {
        const url = new URL(body.url);
        const dom = htmlProcessor.parse(await fetch(url).then(r => r.text()));
        dom.querySelectorAll('script').forEach(e => e.remove());
        dom.querySelectorAll('link[rel="stylesheet"]').forEach(e => e.remove());
        dom.querySelectorAll('meta').forEach(e => e.remove());
        dom.querySelector('link[rel="icon"]').remove();
        dom.querySelector('link[rel="apple-touch-icon"]').remove();
        dom.querySelector('title').remove();
        if (url.hostname == 'thefemdevs.com') {
            dom.querySelector('head').insertAdjacentHTML('beforeend', `<style>${(await fetch('https://cdn.thefemdevs.com/assets/css/d').then(r => r.text())).replace('\n', '').replace(/\/\*.{1,}\*\//gmi, '')}</style>`)
            dom.querySelector('body > div').remove();
            dom.querySelector('body > hero').remove();
        }
        return dom.toString();
    }
}

router
    .post('/send', async (req, res) => {
        const connection = await req.Database.pool.connect();
        const [_, token] = req.headers['authorization'].split(' ');
        const { rows } = await connection.query(`SELECT * FROM public.APITokens WHERE token = '${token}'`)
        if (rows.length == 0) return res.sendError(5)
        const { rows: userRows } = await connection.query(`SELECT * FROM public.users WHERE firebaseuid = '${rows[0].associatedfirebaseuid}'`)
        if (userRows.length == 0) return res.sendError(0); // misc error
        const { permissions } = userRows[0];
        const mainUser = User.fromFullPermissionBitString(permissions)
        if (!mainUser.hasPermission('Global::Role.Owner', false)) {
            connection.release();
            return res.sendError(12);
        }
        connection.release();

        const
            /** @type {string} */
            login = req.headers['x-user'],
            /** @type {string} */
            context = req.headers['x-context'];
        if (!login || !context) return res.sendError(6);
        try {
            const tad = Auth.decode(login).split(':');
            const ad = {
                user: `${tad[0]}@thefemdevs.com`,
                pass: `${tad[1]}`,
            }
            const contextData = Object.fromEntries(context.split(';').map(s => s.split(':')))
            const transport = nodemailer.createTransport({
                auth: ad,
                host: "smtp.forwardemail.net",
                port: 465,
                secure: true,
            });
            const { to, subject } = req.body;
            const body = await getBody(req.body);
            if (!to || !subject || !body) return res.sendError(9)
            const from = {
                name: contextData.n,
                address: ad.user
            }
            transport.sendMail({
                encoding: 'utf-8',
                textEncoding: 'base64',
                envelope: { from, to, },
                from,
                sender: from,
                replyTo: contextData.r || ad.user,
                to: to,
                subject: subject,
                [(body.startsWith('<')) ? 'html' : 'text']: body,
            });
            res.status(200).send('OK');
        } catch {
            return res.sendError(0);
        }

    });

module.exports = router;