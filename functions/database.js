const pg = require('pg');
const cron = require('node-cron');
require('dotenv').config();

class PGDatabase {
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
        const connection = await new PGDatabase().pool.connect();
        const query = `INSERT INTO public.accessLogs (ipAddress, method, route, statusCode, timing, dataTransferred) VALUES ($1, $2, $3, $4, $5, $6)`;
        const values = [data.ip, data.method, data.url, data.status, data.time, data.bytes];
        await connection.query(query, values).catch(e => console.error(e));
        connection.release();
    }

    /**
     * @param {string} ip
     * @returns {Promise<[boolean, string | null]>}
     */
    testIPBlacklisted = async (ip) => {
        const connection = await new PGDatabase().pool.connect();
        const { rows } = await connection.query(`SELECT ipHash, reason FROM public.websiteBlacklist WHERE active = TRUE`);
        connection.release();
        for (const row of rows) {
            if (row.ipHash === ip) return [true, row.reason];
        }
        return [false, null];
    }
}

module.exports = PGDatabase