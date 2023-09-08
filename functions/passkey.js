const Database = require('./database');

async function getUser(id) {
    const connection = await Database.getConnection();
    const [rows] = await connection.query('SELECT * FROM users WHERE firebaseUID = ?', [id]);
    Database.closeConnection(connection);
    return rows.at(0);
}

async function saveAuthForUser(user, authdata) {
    const { firebaseUID } = user;
    const { credentialID, credentialPublicKey, counter, transports } = authdata;
    const connection = await Database.getConnection();
    await connection.query('INSERT INTO userAuthData (firebaseUID, credentialID, credentialPublicKey, counter, transports) VALUES (?, ?, ?, ?, ?)', [firebaseUID, credentialID, credentialPublicKey, counter, transports.join(',')]);
    Database.closeConnection(connection);
}

async function getUserAuthenticators(user) {
    const connection = await Database.getConnection();
    const [rows] = await connection.query('SELECT * FROM userAuthData WHERE firebaseUID = ?', [user.firebaseUID]);
    Database.closeConnection(connection);

    return rows.map(row => ({
        credentialID: row.credentialID,
        credentialPublicKey: row.credentialPublicKey,
        counter: row.counter,
        transports: row.transports.split(','),
    }));
}

async function updateAuthCounter(user, credentialID, counter) {
    const connection = await Database.getConnection();
    await connection.query('UPDATE userAuthData SET counter = ? WHERE firebaseUID = ? AND credentialID = ?', [counter, user.firebaseUID, credentialID]);
    Database.closeConnection(connection);
}

async function getUserAuthenticator(user, credentialID) {
    const connection = await Database.getConnection();
    const [rows] = await connection.query('SELECT * FROM userAuthData WHERE firebaseUID = ? AND credentialID = ?', [user.firebaseUID, credentialID]);
    Database.closeConnection(connection);

    const row = rows.at(0);
    if (row == undefined) return undefined;

    return {
        credentialID: row.credentialID,
        credentialPublicKey: row.credentialPublicKey,
        counter: row.counter,
        transports: row.transports.split(','),
    };
}

module.exports = {
    getUser,
    saveAuthForUser,
    getUserAuthenticators,
    updateAuthCounter,
    getUserAuthenticator,
};