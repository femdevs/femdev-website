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
        .setHeader('X-Repo','https://github.com/femdevs/femdev-website')
        .setHeader('X-Live-Deploy', 'https://thefemdevs.com')
        .setHeader('X-Repository-License', 'Affero General Public License v3.0 or newer (AGPL-3.0-or-later)')
        .setHeader('X-OS', process.platform)
        .removeHeader('X-Powered-By')
        // .setHeader('X-Head', latestHead);
    next();
}