const pg = require('pg');
const cron = require('node-cron');
const SQL = require('sql-template-strings');
const events = require('events');
require('dotenv').config();

const CSPData = require('./security');

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
            query_timeout: 7500,
            allowExitOnIdle: true,
        }
        this.pool = new pg.Pool(this.cfgs);
        cron.schedule('*/5 * * * *', () => {
            this.pool.end();
            this.pool = new pg.Pool(this.cfgs);
        })

        this.ipBlacklist = [];

        this
            .on('access', (data) => {
                this.pool.connect().then(connection => {
                    connection.query(
                        `INSERT INTO public.accesslogs (ipaddress, method, route, statuscode, timing, datatransferred) VALUES ($1, $2, $3, $4, $5, $6)`,
                        [data.ip, data.method, data.url, data.status, data.time, data.bytes]
                    ).catch(console.error)
                    connection.release();
                })
            })
            .on('token', (data) => {
                this.pool.connect().then(connection => {
                    connection.query(
                        `INSERT INTO public.apitokens (token, associatedfirebaseuid, stripesub) VALUES ($1, $2, $3)`,
                        [data.generatedToken, data.firebaseuid, data.sub]
                    ).catch(console.error)
                    connection.query(
                        `INSERT INTO public.apiUsage (apiToken, totalUses) VALUES ($1, $2)`,
                        [data.generatedToken, 0]
                    ).catch(console.error)
                    connection.release();
                })

            })
            .on('user', (data) => {
                this.pool.connect().then(connection => {
                    const { uid, displayName: dn, firstname: fn, lastname: ln, email, permissions: perms } = data;
                    connection.query(SQL`INSERT INTO public.users(firebaseuid, displayname, firstname, lastname, email, permissions) VALUES (${uid}, ${dn}, ${fn}, ${ln}, ${email}, ${perms})`).catch(console.error)
                    connection.release();
                })
            })
            .on('updateBlacklist', () => {
                this.pool.connect()
                    .then(connection => {
                        connection.query(`SELECT * FROM public.websiteblacklist WHERE active = TRUE`).then(({ rows }) => {
                            this.ipBlacklist = rows.map(row => ({ hash: row.iphash, reason: row.reason }))
                        }).catch(console.error)
                        connection.release()
                    })
            })
    }
    async getServerStatus() {
        const connection = await this.pool.connect();
        const status = (await connection.query('SELECT * FROM public.websitestatus')).rows[0];
        connection.release();
        return ['unknown', 'up', 'down', 'degraded', 'maintenance'][status.upstatus];
    }

    /** @param {CSPData} data */
    async SaveCSPReport(data) {
        const connection = await this.pool.connect();
        await connection.query(
            SQL`INSERT INTO public.cspreports (blockeduri, documenturi, disposition, effectivedirective, violateddirective, originalpolicy, referrer, statuscode, samplescript, timestamp, repid) VALUES (${data.blockedURI}, ${data.documentURI}, ${data.disposition}, ${data.effectiveDirective}, ${data.violatedDirective}, ${data.originalPolicy}, ${data.referrer}, ${data.statusCode}, ${data.scriptSample}, ${data.timestamp}, ${data.reportId})`
        )
        connection.release();
    }
}

module.exports = PGDatabase;