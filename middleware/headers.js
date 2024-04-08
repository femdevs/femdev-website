

/** @type {import('express').RequestHandler} */
module.exports = (req, res, next) => {
    const { platform: os, versions: v } = process;
    res
        .setHeader('X-Node-Version', v.node)
        .setHeader('X-Frame-Options', 'SAMEORIGIN')
        .setHeader('Referrer-Policy', 'same-origin')
        .setHeader('X-Content-Type-Options', 'nosniff')
        .setHeader('X-Live-Deploy', 'https://thefemdevs.com')
        .setHeader('X-Repo', 'https://github.com/femdevs/femdev-website')
        .setHeader('NEL', '{"report_to":"default","max_age":31536000,"include_subdomains":true}')
        .setHeader('X-Repository-License', 'Affero General Public License v3.0 or newer (AGPL-3.0-or-later)')
        .setHeader('X-OS', os == 'win32' ? 'Windows' : os == 'linux' ? 'Linux' : os == 'darwin' ? 'MacOS' : 'Other')
        .setHeader('Document-Policy', 'unsized-media=?0, document-write=?0, max-image-bpp=2.0, frame-loading=lazy, report-to=doc-ep');
    return next();
}