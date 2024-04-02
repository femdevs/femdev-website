const router = require('express').Router();
const Auth = require('../../../functions/crypto');
const htmlProcessor = require('node-html-parser');
const nodemailer = require('nodemailer');
const assert = require('assert');

class MailReqProcesser {
    static getAuth(ah) {
        assert(ah)
        const tad = Auth.decode(ah).split(':');
        return {
            user: `${tad[0]}@thefemdevs.com`,
            pass: `${tad[1]}`,
        }
    }
    static getContext(ch) {
        const context = Object.fromEntries(ch.split(';').map(s => s.split(':')))
        return Object.assign({}, { replyTo: context['r'], senderName: context['n'] })
    }
    static getTransporter(a) {
        return nodemailer.createTransport({
            auth: a,
            host: "smtp.forwardemail.net",
            port: 465,
            secure: true,
        })
    }
    static envlope(ts, f, rt, t, s, b) {
        return Object.assign({}, {
            from: f,
            to: t,
            subject: s,
            encoding: 'utf-8',
            textEncoding: 'base64',
            envelope: { from: ts, to: t },
            sender: f,
            replyTo: rt,
            [(b.startsWith('<')) ? 'html' : 'text']: b,
        })
    }
    static async userSpecific(req) {
        const auth = this.getAuth(req.headers['x-user']);
        const context = this.getContext(req.headers['x-context'])
        const transport = this.getTransporter(auth);
        const { to, subject } = req.body;
        const body = await getBody(req.body);
        const from = {
            name: context['senderName'] || 'Unknown User',
            address: ad.user
        }
        const replyTo = { name: from.name, address: context['replyTo'] || from.address }
        transport.sendMail(this.envlope(from, from, replyTo, to, subject, body));
    }
    static async global(req) {
        const { to, subject } = req.body;
        const body = await getBody(req.body);
        const auth = this.getAuth(req.headers['x-user']);
        const context = this.getContext(req.headers['x-context']);
        const from = { address: req.headers['x-from'], name: context['senderName'] || 'Global Admin' };
        const replyTo = context['replyTo'] ? { address: context['replyTo'], name: context['senderName'] } : undefined;
        assert(auth.user == 'global@thefemdevs.com')
        assert(Auth.completeHash(auth.pass) == 'B4GVZRTW86j4Ki_jeIe74Hyv7K8bKPV_lyTgHJmuVEoBwqtr3OhUTpa2MaRdU7qA9CwPc9UpoB3T_rfVhaGY9A')
        const trueFrom = { name: 'Global Admin', address: '*@thefemdevs.com' }
        const transport = this.getTransporter(auth);
        transport.sendMail(this.envlope(trueFrom, from, replyTo, to, subject, body));
    }
    static Send(req, res, type) {
        try {
            this[type == 'user' ? 'userSpecific' : 'global'](req)
            res.status(200).send('OK');
        } catch {
            return res.sendError(0);
        }
    }
}

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
        if (await req.checkPermissions(req, res, { multi: true, perm: ['Global::Role.Administrator', 'Global::Role.Owner'], allowMgr: false })) MailReqProcesser.Send(req, res, 'user');
    })
    .post('/sendglobal', async (req, res) => {
        if (await req.checkPermissions(req, res, { multi: false, perm: 'Global::Role.Owner', allowMgr: false })) MailReqProcesser.Send(req, res, 'global');
    })

module.exports = router;