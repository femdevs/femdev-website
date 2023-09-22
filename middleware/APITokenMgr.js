// const Cryptolens = require('cryptolens');
require('dotenv').config();

// const {getConnection, closeConnection} = require('../functions/database')

const TokenManager = require('../src/crypto')

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 * @returns 
 */
const authHandler = async (req, res, next) => {
    if (!req.headers['authorization']) return res.status(401).json({ error: 'No token provided' });
    const [type, token] = req.headers['authorization'].split(' ');
    if (type !== 'Bearer') return res.status(401).json({ error: 'Invalid token type' });
    if (!token) return res.status(401).json({ error: 'No token provided' });
    if (!TokenManager.verify(token)) return res.status(401).json({ error: 'Invalid token' });
    next();
}

module.exports = authHandler;