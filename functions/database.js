const pg = require('pg');
const cron = require('node-cron');
const events = require('events');
require('dotenv').config();

module.exports = class PGDatabase extends events.EventEmitter {
    constructor() {
        super({ captureRejections: true });
        /**
         * @type {pg.PoolConfig}
         */
        this.cfgs = {
            max: 10,
            host: process.env.HOST,
            port: 6543,
            database: process.env.DATABASE,
            user: process.env.USER,
            password: process.env.PASSWORD,
            query_timeout: 5_000,
            allowExitOnIdle: true,
            connectionTimeoutMillis: 10_000,
        }
        this.pool = new pg.Pool(this.cfgs);

        this.ipBlacklist = [];

        this
            .on('access', (data) => {
                this.pool.connect().then(connection => {
                    connection.query(
                        `INSERT INTO public.accesslogs (ipaddress, method, route, statuscode, timing, datatransferred) VALUES ($1, $2, $3, $4, $5, $6)`,
                        [data.ip, data.method, data.url, data.status, data.time, data.bytes]
                    )
                    .catch(console.error)
                    .finally(() => connection.release());
                })
            })
            .on('token', (data) => {
                this.pool.connect().then(connection => {
                    connection.query(
                        `INSERT INTO public.apitokens (token, associatedfirebaseuid, licenseKey) VALUES ($1, $2, $3)`,
                        [data.generatedToken, data.firebaseuid, tokenData.key]
                    ).catch(console.error)
                    connection.query(
                        `INSERT INTO public.apiUsage (apiToken, totalUses) VALUES ($1, $2)`,
                        [data.generatedToken, 0]
                    )
                    .catch(console.error)
                    .finally(() => connection.release());
                })

            })
            .on('user', (data) => {
                this.pool.connect().then(connection => {
                    connection.query(
                        `INSERT INTO public.users (firebaseuid, displayname, firstname, lastname, email, permissions) VALUES ($1, $2, $3, $4, $5, $6)`,
                        [data.uid, data.displayName, data.firstname, data.lastname, data.email, data.permissions]
                    )
                    .catch(console.error)
                    .finally(() => connection.release());
                })
            })
            .on('updateBlacklist', () => {
                this.pool.connect()
                    .then(connection => {
                        connection.query(`SELECT * FROM public.websiteblacklist WHERE active = TRUE`).then(({ rows }) => {
                            this.ipBlacklist = rows.map(row => ({ hash: row.iphash, reason: row.reason }))
                        })
                        .catch(console.error)
                        .finally(() => connection.release())
                    })
            })
        cron
            .schedule(
                '*/5 * * * *',
                () => {
                    if (this.pool instanceof pg.Pool) this.pool.end()
                    this.pool = new pg.Pool(this.cfgs);
                }
            )
        this.pool.on('error', console.error);
    }
};