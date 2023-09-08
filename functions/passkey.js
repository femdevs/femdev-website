const Database = require('./database');

async function getUser(id) {
    const connection = await Database.getConnection();
    const [rows] = await connection.query('SELECT * FROM users WHERE firebaseUID = ?', [id]);
    Database.closeConnection(connection);
    return rows.at(0);
}

async function saveAuthForUser(user, authdata) {
    const connection = await Database.getConnection();
    await connection.query('INSERT INTO userAuthData (firebaseUID, credentialID, credentialPublicKey, counter) VALUES (?, ?, ?, ?)', [user.firebaseUID, authdata.credentialID, authdata.credentialPublicKey, authdata.counter]);
    Database.closeConnection(connection);
}

async function getUserAuthenticators(user) {
    const connection = await Database.getConnection();
    const [rows] = await connection.query('SELECT credentialID, credentialPublicKey, counter FROM userAuthData WHERE firebaseUID = ?', [user.firebaseUID]);
    Database.closeConnection(connection);
    return rows;
}

async function updateAuthCounter(user, credentialID, counter) {
    const connection = await Database.getConnection();
    await connection.query('UPDATE userAuthData SET counter = ? WHERE firebaseUID = ? AND credentialID = ?', [counter, user.firebaseUID, credentialID]);
    Database.closeConnection(connection);
}

module.exports = {
    getUser,
    saveAuthForUser,
    getUserAuthenticators,
    updateAuthCounter,
};