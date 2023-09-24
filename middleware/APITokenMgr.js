// const Cryptolens = require('cryptolens');
require('dotenv').config();

const TokenManager = require('../functions/crypto')

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 * @returns 
 */
const authHandler = async (req, res, next) => {
    if (!req.headers['authorization']) return res.sendError(1);
    const [_, token] = req.headers['authorization'].split(' ');
    if (!token) return res.sendError(1);
    if (!TokenManager.verify(token)) return res.sendError(2);
    const connection = await req.Database.getConnection();
    const [rows] = await connection.query(`SELECT * FROM APITokens WHERE token = '${token}'`)
    if (rows.length == 0) return res.sendError(2);
    connection.query(`SELECT * FROM apiUsage WHERE apiToken = '${token}'`)
        .then(async ([rows]) => {
            await connection.query(`UPDATE apiUsage SET totalUses = ${rows[0].totalUses + 1} WHERE apiToken = '${token}'`)
        })
        .finally(() => req.Database.closeConnection(connection))
    next();
}

module.exports = authHandler;