const pg = require('pg');
const cron = require('node-cron');
require('dotenv').config();
const events = require('events');

module.exports = class PGDatabase extends events.EventEmitter {
    constructor() {
        super();
        this.cfgs = {
            max: 10,
            host: process.env.HOST,
            port: 6543,
            database: process.env.DATABASE,
            user: process.env.USER,
            password: process.env.PASSWORD,
            query_timeout: 2000,
            allowExitOnIdle: true,
        }
        this.pool = new pg.Pool(this.cfgs);
        cron.schedule('*/5 * * * *', () => {
            this.pool.end();
            this.pool = new pg.Pool(this.cfgs);
        })
        this.cache = {
            ids: {
                access: 0,
                token: 0,
                usage: 0,
                user: 0,
                staff: 0
            }
        }
        this
            .on('access', async (data) => {
                const connection = await this.pool.connect();
                if (this.cache.ids.access === 0) this.cache.ids.access = Number((await connection.query(`SELECT id FROM public.accesslogs ORDER BY id DESC LIMIT 1`)).rows[0]?.id ?? 0);
                await connection.query(
                    `INSERT INTO public.accesslogs (id, ipaddress, method, route, statuscode, timing, datatransferred) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [++this.cache.ids.access, data.ip, data.method, data.url, data.status, data.time, data.bytes]
                )
                    .catch(e => console.error(e));
                connection.release();
            })
            .on('token', async (data) => {
                const connection = await this.pool.connect();
                if (this.cache.ids.token === 0) this.cache.ids.token = Number((await connection.query(`SELECT id FROM public.tokens ORDER BY id DESC LIMIT 1`)).rows[0]?.id ?? 0);
                if (this.cache.ids.usage === 0) this.cache.ids.usage = Number((await connection.query(`SELECT id FROM public.tokenUsage ORDER BY id DESC LIMIT 1`)).rows[0]?.id ?? 0);
                await connection.query(`INSERT INTO public.apitokens (id, token, associatedfirebaseuid, licenseKey) VALUES (${++this.cache.ids.token}, '${data.generatedToken}', '${data.firebaseuid}', '${tokenData.key}')`)
                await connection.query(`INSERT INTO public.apiUsage (id, apiToken, totalUses) VALUES (${++this.cache.ids.usage}, '${data.generatedToken}', 0)`)
                connection.release();
            })
            .on('user', async (data) => {
                const connection = await this.pool.connect();
                if (this.cache.ids.user === 0) this.cache.ids.user = Number((await connection.query(`SELECT id FROM public.users ORDER BY id DESC LIMIT 1`)).rows[0]?.id ?? 0);
                const query = `INSERT INTO public.users (id, firebaseuid, displayname, firstname, lastname, email, permissions) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
                const values = [++this.cache.ids.user, data.uid, data.displayName, data.firstname, data.lastname, data.email, data.permissions];
                connection.query(query, values).catch(e => console.error(e)).finally(() => connection.release());
            })
    }
    /**
     * @param {string} ip
     * @returns {Promise<[boolean, string | null]>}
     */
    testIPBlacklisted = async (ip) => {
        const connection = await this.pool.connect();
        const { rows } = await connection.query(`SELECT ipHash, reason FROM public.websiteblacklist WHERE active = TRUE`);
        connection.release();
        for (const row of rows) {
            if (row.ipHash === ip) return [true, row.reason];
        }
        return [false, null];
    }
}