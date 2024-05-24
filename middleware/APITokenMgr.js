// const Cryptolens = require('cryptolens');
require('dotenv').config();
const webUtils = require('@therealbenpai/webutils');


/**
 * Middleware to check if the request has a valid API token
 * @type {import('express').RequestHandler}
 */
module.exports = async (req, res, next) => {
	if (!req.headers['authorization']) return res.sendError(1);
	const token = req.headers['authorization'].split(' ')[1];
	if (!token) return res.sendError(1);
	if (!webUtils.Crypt.Manual.verify(token, process.env['C_IV'], process.env['C_KEY'])) return res.sendError(2);
	const connection = await req.Database.pool.connect();
	const { rows } = await connection.query(`SELECT * FROM public.apitokens WHERE token = '${token}'`);
	if (rows.length === 0) return res.sendError(2);
	await connection.query(`UPDATE public.apiUsage SET totaluses = totaluses + 1 WHERE apitoken = '${token}'`);
	connection.release();
	return next();
};
