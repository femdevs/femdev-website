const Cryptolens = require('cryptolens');
const crypto = require('crypto');
const { Buffer } = require('buffer');
require('dotenv').config();

const {getConnection, closeConnection} = require('../functions/database')

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
    else return next();
    const connection = await getConnection();
    const [rows] = await connection
        .query(`SELECT * FROM APITokens WHERE token = '${token}' LIMIT 1;`);
    if (rows.length == 0) return res.status(401).json({ error: 'No token found in the database' });
    const { id, token: DBToken, associatedFirebaseUID, licenceKey } = rows[0];
    if (DBToken !== token) return res.status(401).json({ error: 'Invalid token' });
    Cryptolens.Key.Activate(process.env.CRYPTOLENS_TOKEN, "<RSAKeyValue><Modulus>1vC3F7cERLgTy7AIxoGdezo1w+fEszfsK40NAmnrPLpYzoiRT1kpHQu/+RO8ZDCsz0rjhcBY1D2ITMZTocoS+bnzgvO1aY0tCFNsQ1DazILMpVVnKe10RnQ2ZEdU8N5H9IuK7hWiybIVlx0PDoTyo3b+ncRPvHdQXKK/HHPFlwCTVgX+Slf9TWulu3J0gTi7EuMHCjWgFjl5oN/Mud/PqFO5y2FFoR9oF8blFExRGrMZ2Zi0DeTnpO2Hyi3XZR3eQ3C0t9rCenHnlT8zt/4Nkm6lJUFH1LmOeVqrH9VIhWZ3IVNacT/6gPE8f33RXPsjNJCEHtv299QLIo6EX6LdeQ==</Modulus><Exponent>AQAB</Exponent></RSAKeyValue>", 21956, licenceKey)
        .then(async (result) => {
            if (!result) return res.status(401).json({ error: 'License Key Invalid' });
            next();
        })
        .catch(async (err) => {
            await connection.query(`DELETE FROM APITokens WHERE id = '${id}';`);
            return res.status(401).json({ error: 'License Key Invalid' });
        });
}

module.exports = authHandler;