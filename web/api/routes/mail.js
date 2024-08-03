const
	assert = require('assert'),
	nodemailer = require('nodemailer'),
	router = require('express').Router(),
	htmlMinifier = require('html-minifier-terser'),
	Auth = require('../../../functions/crypto'),
	htmlProcessor = require('node-html-parser');

class MailReqProcessor {
	static getAuth(ah) {
		return Object.fromEntries(
			Auth.decode(ah).split(':').slice(0, 2)
				.map((user, index) => index === 0 ? ['user', `${user}@thefemdevs.com`] : ['pass', user]),
		);
	}
	static from(header) {
		return Object.fromEntries(
			header.split(';')
				.map(sender => sender.split(':'))
				.map(([k, v]) => [
					k === 'a'
						? 'address'
						: k === 'n'
							? 'name'
							: k === 'r'
								? 'replyTo'
								: null, v,
				],
				).filter(([k, _]) => k !== null),
		);
	}
	static async parseBody(body) {
		return body.text
			|| await (async function () {
				if (!body.url && !body.html) return null;
				const url = new URL(body.url);
				const dom = htmlProcessor.parse(body.html || (await fetch(url).then(res => res.text())));
				dom.querySelectorAll(
					[
						'link',
						'form',
						'meta',
						'title',
						'style',
						'embed',
						'input',
						'script',
						'iframe',
						'object',
						'button',
						'noscript',
						...(url.hostname === 'thefemdevs.com' ? ['body>hero', 'body>div'] : []),
					].join(','),
				).forEach(element => element.remove());
				if (url.hostname === 'thefemdevs.com')
					dom.querySelector('head').insertAdjacentHTML(
						'beforeend',
						`<style>${await fetch('https://cdn.thefemdevs.com/assets/css/d').then(res => res.text())}</style>`,
					);
				return htmlMinifier.minify(dom.toString(), {
					collapseBooleanAttributes: true,
					collapseInlineTagWhitespace: true,
					collapseWhitespace: true,
					includeAutoGeneratedTags: false,
					minifyCSS: true,
					minifyJS: true,
					minifyURLs: true,
					quoteCharacter: '"',
					removeAttributeQuotes: true,
					removeComments: true,
					removeEmptyAttributes: true,
					removeRedundantAttributes: true,
					removeScriptTypeAttributes: true,
					removeStyleLinkTypeAttributes: true,
					removeTagWhitespace: true,
					sortAttributes: true,
					sortClassName: true,
					useShortDoctype: true,
				});
			})();
	}
	static getTransporter(auth) {
		return nodemailer.createTransport({
			auth: auth,
			host: "smtp.forwardemail.net",
			port: 465,
			secure: true,
		});
	}
	static envlope(ts, from, to, subject, body) {
		return Object.assign({}, {
			from,
			to,
			subject,
			encoding: 'utf-8',
			textEncoding: 'base64',
			envelope: { from: ts, to: to },
			sender: from,
			replyTo: { name: from.name, address: from.replyTo || from.address },
			[(body.startsWith('<')) ? 'html' : 'text']: body,
		});
	}
	static async Send(req, res) {
		const auth = this.getAuth(req.headers['x-user']);
		const from = this.from(req.headers['x-from']);
		const body = await this.parseBody(req.body);
		if (!auth || !from) return res.sendError(8);
		if (!body) return res.sendError(10);
		const { to, subject } = req.body;
		const type = auth.user.split('@')[0] === 'global';
		assert(auth.user === (type ? 'global@thefemdevs.com' : from.address));
		if (type) assert(Auth.completeHash(auth.pass) === 'B4GVZRTW86j4Ki_jeIe74Hyv7K8bKPV_lyTgHJmuVEoBwqtr3OhUTpa2MaRdU7qA9CwPc9UpoB3T_rfVhaGY9A');
		const trueFrom = { name: type ? 'Global Admin' : from.name, address: type ? '*@thefemdevs.com' : from.address };
		const transport = this.getTransporter(auth);
		transport.sendMail(this.envlope(trueFrom, from, to, subject, body));
		res.status(200).send("OK");
	}
}

router
	.post('/send', async (req, res) => {
		if (await req.checkPermissions(req, res, { multi: false, perm: 'Global::Role.Owner', allowMgr: true })) MailReqProcessor.Send(req, res);
	});

module.exports = router;
