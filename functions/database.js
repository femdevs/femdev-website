const pg = require('pg');
const cron = require('node-cron');
require('dotenv').config();

module.exports = class PGDatabase {
    constructor() {
        this.pool = new pg.Pool({
            max: 10,
            host: process.env.HOST,
            port: 6543,
            database: process.env.DATABASE,
            user: process.env.USER,
            password: process.env.PASSWORD,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
            query_timeout: 2000,
            allowExitOnIdle: true,
            keepAlive: true,
        });
        cron.schedule('*/5 * * * *', () => {
            this.pool.end();
            this.pool = new pg.Pool({
                max: 10,
                host: process.env.HOST,
                port: 6543,
                database: process.env.DATABASE,
                user: process.env.USER,
                password: process.env.PASSWORD,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
                query_timeout: 2000,
                allowExitOnIdle: true,
                keepAlive: true,
            });
        });
        this.cache = {
            ids: {
                access: 0,
                token: 0,
                usage: 0,
                user: 0,
                staff: 0
            }
        }
    }

    /**
     * @param {{ip: string, method: string, url: string, status: number, time: number, bytes: number}} data 
     */
    saveAccessLog = async (data) => {
        const connection = await this.pool.connect();
        if (this.cache.ids.access === 0) {
            const { rows } = await connection.query(`SELECT id FROM public.accesslogs ORDER BY id DESC LIMIT 1`);
            this.cache.ids.access = Number(rows[0]?.id ?? 0);
        }
        const newID = this.cache.ids.access++;
        await connection.query(
            `INSERT INTO public.accesslogs (id, ipaddress, method, route, statuscode, timing, datatransferred) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [newID, data.ip, data.method, data.url, data.status, data.time, data.bytes]
        )
            .catch(e => console.error(e));
        connection.release();
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

    createUser = async (userData) => {
        const connection = await this.pool.connect();
        if (this.cache.ids.user === 0) {
            const { rows } = await connection.query(`SELECT id FROM public.users ORDER BY id DESC LIMIT 1`);
            this.cache.ids.user = Number(rows[0]?.id ?? 0);
        }
        const newID = this.cache.ids.user++;
        const query = `INSERT INTO public.users (id, firebaseuid, displayname, firstname, lastname, email, permissions) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        const values = [newID, userData.uid, userData.displayName, userData.firstname, userData.lastname, userData.email, userData.permissions];
        connection.query(query, values).catch(e => console.error(e)).finally(() => connection.release());
    }

    createToken = async (tokenData) => {
        const connection = await this.pool.connect();
        if (this.cache.ids.token === 0) {
            const { rows } = await connection.query(`SELECT id FROM public.tokens ORDER BY id DESC LIMIT 1`);
            this.cache.ids.token = Number(rows[0]?.id ?? 0);
        }
        if (this.cache.ids.usage === 0) {
            const { rows } = await connection.query(`SELECT id FROM public.tokenUsage ORDER BY id DESC LIMIT 1`);
            this.cache.ids.usage = Number(rows[0]?.id ?? 0);
        }
        const newTokenID = this.cache.ids.token++
        const newTokenUsageID = this.cache.ids.usage++
        await connection.query(`INSERT INTO public.apitokens (id, token, associatedfirebaseuid, licenseKey) VALUES (${newTokenID}, '${tokenData.generatedToken}', '${tokenData.firebaseuid}', '${tokenData.key}')`)
        await connection.query(`INSERT INTO public.apiUsage (id, apiToken, totalUses) VALUES (${newTokenUsageID}, '${tokenData.generatedToken}', 0)`)
        connection.release();
    }
}