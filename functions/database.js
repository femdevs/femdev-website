const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
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
})

/**
 * @param {{ip: string, date: string, method: string, url: string, status: number, time: number, bytes: number}} data 
 */
const saveAccessLog = async (data) => {
    const connection = await pool.connect();
    const query = `INSERT INTO public.accessLogs (ipAddress, time, method, route, statusCode, timing, dataTransferred) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    const values = [data.ip, data.date, data.method, data.url, data.status, data.time, data.bytes];
    await connection.query(query, values).catch(e => console.error(e));
    connection.release();
}

/**
 * @param {string} ip
 * @returns {Promise<[boolean, string | null]>}
 */
const testIPBlacklisted = async (ip) => {
    const connection = await pool.connect();
    const { rows } = await connection.query(`SELECT ipHash, reason FROM public.websiteBlacklist WHERE active = TRUE`);
    connection.release();
    for (const row of rows) {
        if (row.ipHash === ip) return [true, row.reason];
    }
    return [false, null];
}

module.exports = {
    Pool: pool,
    saveAccessLog,
    testIPBlacklisted,
};