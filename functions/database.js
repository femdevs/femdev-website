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
    }

    /**
     * @param {{ip: string, method: string, url: string, status: number, time: number, bytes: number}} data 
     */
    saveAccessLog = async (data) => {
        const connection = await this.pool.connect();
        const { rows } = await connection.query(`SELECT id FROM public.accesslogs ORDER BY id DESC LIMIT 1`);
        await connection.query(
            `INSERT INTO public.accesslogs (id, ipaddress, method, route, statuscode, timing, datatransferred) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [Number(rows[0]?.id ?? 0) + 1, data.ip, data.method, data.url, data.status, data.time, data.bytes]
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
        // get last id
        const { rows } = await connection.query(`SELECT id FROM public.users ORDER BY id DESC LIMIT 1`);
        const newId = (rows[0]?.id ?? 0) + 1;
        // create user
        const query = `INSERT INTO public.users (id, firebaseuid, displayname, firstname, lastname, email, permissions) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        const values = [newId, userData.uid, userData.displayName, userData.firstname, userData.lastname, userData.email, userData.permissions];
        connection.query(query, values).catch(e => console.error(e)).finally(() => connection.release());
    }

    createToken = async (tokenData) => {
        const connection = await this.pool.connect();
        const { rows: rowsa } = await connection.query(`SELECT id FROM public.APITokens ORDER BY id DESC LIMIT 1`);
        const { rows: rowsb } = await connection.query(`SELECT id FROM public.APITokenUsage ORDER BY id DESC LIMIT 1`);
        const newTokenID = (rowsa[0]?.id ?? 0) + 1;
        const newTokenUsageID = (rowsb[0]?.id ?? 0) + 1;
        await connection.query(`INSERT INTO public.apitokens (id, token, associatedfirebaseuid, licenseKey) VALUES (${newTokenID}, '${tokenData.generatedToken}', '${tokenData.firebaseuid}', '${tokenData.key}')`)
        await connection.query(`INSERT INTO public.apiUsage (id, apiToken, totalUses) VALUES (${newTokenUsageID}, '${tokenData.generatedToken}', 0)`)
        connection.release();
    }
}