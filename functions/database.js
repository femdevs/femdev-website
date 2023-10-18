const pg = require('pg');
const cron = require('node-cron');
const events = require('events');
require('dotenv').config();

class PGDatabase extends events.EventEmitter {
    constructor() {
        super({ captureRejections: true });
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
                        `INSERT INTO public.apitokens (token, associatedfirebaseuid, licenseKey) VALUES ($1, $2, $3)`,
                        [data.generatedToken, data.firebaseuid, tokenData.key]
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
                    connection.query(
                        `INSERT INTO public.users (firebaseuid, displayname, firstname, lastname, email, permissions) VALUES ($1, $2, $3, $4, $5, $6)`,
                        [data.uid, data.displayName, data.firstname, data.lastname, data.email, data.permissions]
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