const MySQL = require('mysql2');

const Pool = MySQL.createPool({
    connectionLimit: 10,
    host: 'aws.connect.psdb.cloud',
    user: 'ksnjpp8wyrrxrswne5k6',
    password: 'pscale_pw_im6VHm18dotzbD8SGnfdQW1pPloWSfFFZMqwJtd1yXJ',
    database: 'fembot',
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

module.exports = {
    Pool,
    getConnection,
    closeConnection,
    saveAccessLog,
};