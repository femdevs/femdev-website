const MySQL = require('mysql2');
require('dotenv').config();

const Pool = MySQL.createPool({
    connectionLimit: 10,
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: 3306,
    ssl: {
        rejectUnauthorized: true,
    },
}).promise();

const getConnection = () => Pool.getConnection();
const closeConnection = (connection) => connection.release();

/**
 * @param {{ip: string, date: string, method: string, url: string, status: number, time: number, bytes: number}} data 
 */
const saveAccessLog = async (data) => {
    const connection = await getConnection();
    const query = `INSERT INTO accessLogs (ipAddress, time, method, route, statusCode, timing, dataTransferred) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [data.ip, data.date, data.method, data.url, data.status, data.time, data.bytes];
    await connection.query(query, values);
    closeConnection(connection);
}

/**
 * @param {string} ip
 * @returns {Promise<[boolean, string | null]>}
 */
const testIPBlacklisted = async (ip) => {
    const connection = await getConnection();
    const query = `SELECT ipHash, reason FROM websiteBlacklist WHERE active = 1`;
    const [rows] = await connection.query(query);
    closeConnection(connection);
    for (const row of rows) {
        if (row.ipHash === ip) return [true, row.reason];
    }
    return [false, null];
}

module.exports = {
    Pool,
    getConnection,
    closeConnection,
    saveAccessLog,
    testIPBlacklisted,
};