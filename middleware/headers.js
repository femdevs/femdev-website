const fs = require('fs');
// const latestHead = fs.readFileSync(`${process.cwd()}/.git/refs/heads/master`, 'utf8').trim();

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
module.exports = (req, res, next) => {
    res
        .setHeader('X-Repo','https://github.com/sparty182020/server-site')
        .setHeader('X-Live-Deploy', 'https://spaty18.com')
        .setHeader('X-OS-License', 'Affero General Public License v3.0 or newer (AGPL-3.0-or-later)')
        // .setHeader('X-Head', latestHead);
    next();
}