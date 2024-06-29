const pg = require('pg');
const cron = require('node-cron');
const { SQL } = require('sql-template-strings');
const events = require('events');
require('dotenv').config();

class PGDatabase extends events.EventEmitter {
	constructor() {
		super({ captureRejections: true });
		/** @type {pg.PoolConfig} */
		this.cfgs = {
			max: 10,
			host: process.env.HOST,
			port: 6543,
			database: process.env.DATABASE,
			user: process.env.USER,
			password: process.env.PASSWORD,
			// eslint-disable-next-line camelcase
			query_timeout: 7500,
			allowExitOnIdle: true,
		};
		this.pool = new pg.Pool(this.cfgs);
		cron.schedule('*/5 * * * *', () => {
			this.pool.end();
			this.pool = new pg.Pool(this.cfgs);
		});

		this.ipb = [];

		this
			.on('token', data => {
				this.pool.connect().then(connection => {
					connection.query(SQL`
INSERT INTO public.apitokens
(token, associatedfirebaseuid, stripesub)
VALUES (${data.generatedToken}, ${data.firebaseuid}, ${data.sub ?? ''});

INSERT INTO public.apiUsage
(apiToken, totalUses)
VALUES (${data.generatedToken}, 0)`,
					).catch();
					connection.release();
				});

			})
			.on('user', data => {
				this.pool.connect().then(connection => {
					const { uid, displayName: dn, firstname: fn, lastname: ln, email, permissions: perms } = data;
					connection.query(SQL`
INSERT INTO public.users
(firebaseuid, displayname, firstname, lastname, email, permissions)
VALUES (${uid}, ${dn}, ${fn}, ${ln}, ${email}, ${perms})`,
					).catch();
					connection.release();
				});
			})
			.on('updateBlacklist', () => {
				this.pool.connect().then(connection => {
					connection.query("SELECT * FROM public.websiteblacklist WHERE active = TRUE").then(({ rows }) => {
						this.ipb = rows.map(row => ({ hash: row.iphash, reason: row.reason }));
					}).catch();
					connection.release();
				});
			})
			.on('tlsrpt', data => {
				this.pool.connect().then(connection => {
					connection.query(SQL`INSERT INTO public.tlsreports (report) VALUES (${data})`).catch();
					connection.release();
				});
			});
	}
	async getServerStatus() {
		const connection = await this.pool.connect();
		const { upstatus } = (await connection.query('SELECT upstatus FROM public.websitestatus WHERE id = 1')).rows[0];
		connection.release();
		return upstatus;
	}
	async SaveCSPReport(data) {
		const connection = await this.pool.connect();
		const {
			blockedURI: bu,
			documentURI: du,
			disposition: dis,
			effectiveDirective: ed,
			violatedDirective: vd,
			originalPolicy: op,
			referrer: ref,
			statusCode: sc,
			scriptSample: ss,
			reportId: rid,
		} = data;
		await connection.query(SQL`
INSERT INTO public.cspreports
(blockeduri, documenturi, disposition, effectivedirective, violateddirective,
    originalpolicy, referrer, statuscode, samplescript, repid)
VALUES (${bu}, ${du}, ${dis}, ${ed}, ${vd}, ${op}, ${ref}, ${sc}, ${ss}, ${rid})`,
		);
		connection.release();
	}
}

module.exports = PGDatabase;
