const pg = require('pg');
const cron = require('node-cron');
const events = require('events');
require('dotenv').config();

class PGDatabase extends events.EventEmitter {
    constructor() {
        super();
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
            connectionTimeoutMillis: 5_000,
        }
        this.pool = new pg.Pool(this.cfgs);
        cron
            .schedule(
                '*/5 * * * *',
                () => {
                    if (this.pool instanceof pg.Pool) return this.pool = new pg.Pool(this.cfgs);
                    this.pool.end();
                    this.pool = new pg.Pool(this.cfgs);
                },
                {
                    runOnInit: true
                }
            )
        this.cache = {
            ids: {
                access: 0,
                token: 0,
                usage: 0,
                user: 0,
                staff: 0
            }
        }

        this.ipBlacklist = [];

        this.pool.connect()
            .then(async (connection) => {
                this.cache.ids.access = Number((await connection.query(`SELECT id FROM public.accesslogs ORDER BY id DESC LIMIT 1`)).rows[0]?.id ?? 0);
                this.cache.ids.token = Number((await connection.query(`SELECT id FROM public.apitokens ORDER BY id DESC LIMIT 1`)).rows[0]?.id ?? 0);
                this.cache.ids.usage = Number((await connection.query(`SELECT id FROM public.apiUsage ORDER BY id DESC LIMIT 1`)).rows[0]?.id ?? 0);
                this.cache.ids.user = Number((await connection.query(`SELECT id FROM public.users ORDER BY id DESC LIMIT 1`)).rows[0]?.id ?? 0);
                this.cache.ids.staff = Number((await connection.query(`SELECT id FROM public.staff ORDER BY id DESC LIMIT 1`)).rows[0]?.id ?? 0);
                this.ipBlacklist = (await connection.query(`SELECT * FROM public.websiteblacklist WHERE active = TRUE`)).rows.map(row => ({ hash: row.iphash, reason: row.reason }));
                connection.release();
            })

        this
            .on('access', (data) => {
                const ID = ++this.cache.ids.access
                this.pool.connect().then(connection => {
                    connection.query(
                        `INSERT INTO public.accesslogs (id, ipaddress, method, route, statuscode, timing, datatransferred) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [ID, data.ip, data.method, data.url, data.status, data.time, data.bytes]
                    ).catch(console.error)
                    connection.release();
                })
            })
            .on('token', (data) => {
                const TID = ++this.cache.ids.token
                const TUID = ++this.cache.ids.usage
                this.pool.connect().then(connection => {
                    connection.query(
                        `INSERT INTO public.apitokens (id, token, associatedfirebaseuid, licenseKey) VALUES ($1, $2, $3, $4)`,
                        [TID, data.generatedToken, data.firebaseuid, tokenData.key]
                    ).catch(console.error)
                    connection.query(
                        `INSERT INTO public.apiUsage (id, apiToken, totalUses) VALUES ($1, $2, $3)`,
                        [TUID, data.generatedToken, 0]
                    ).catch(console.error)
                    connection.release();
                })

            })
            .on('user', (data) => {
                const ID = ++this.cache.ids.user
                this.pool.connect().then(connection => {
                    connection.query(
                        `INSERT INTO public.users (id, firebaseuid, displayname, firstname, lastname, email, permissions) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [ID, data.uid, data.displayName, data.firstname, data.lastname, data.email, data.permissions]
                    ).catch(console.error)
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
}

module.exports = PGDatabase;