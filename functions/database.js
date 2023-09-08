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

module.exports = {
    Pool,
    getConnection,
    closeConnection,
};