// const Cryptolens = require('cryptolens');
require('dotenv').config();

const TokenManager = require('../functions/crypto')
const { RequestHandler } = require('express');

/** @type {import('express').RequestHandler} */ module.exports = async (req, res, next) => {

    if (!req.headers['authorization']) return res.sendError(1);
    const [_, token] = req.headers['authorization'].split(' ');
    if (!token) return res.sendError(1);
    if (!TokenManager.verify(token)) return res.sendError(2);
    const connection = await req.Database.Pool.connect();
    const { rows } = await connection.query(`SELECT * FROM public.apitokens WHERE token = '${token}'`)
    if (rows.length == 0) return res.sendError(2)
    await connection.query(`UPDATE public.apiUsage SET totaluses = totaluses + 1 WHERE apitoken = '${token}'`)
    connection.release();
    next();
}