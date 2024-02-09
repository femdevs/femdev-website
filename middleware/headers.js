/** @type {import('express').RequestHandler} */ module.exports = (req, res, next) => {
    const { platform: os, versions: v } = process;
    res
        .setHeader('X-Repo', 'https://github.com/femdevs/femdev-website')
        .setHeader('X-Live-Deploy', 'https://thefemdevs.com')
        .setHeader('X-Repository-License', 'Affero General Public License v3.0 or newer (AGPL-3.0-or-later)')
        .setHeader('X-OS', os == 'win32' ? 'Windows' : os == 'linux' ? 'Linux' : os == 'darwin' ? 'MacOS' : 'Other')
        .setHeader('X-Node-Version', v.node)
        .setHeader('Content-Security-Policy', "default-src *; script-src 'self' google.com *.google.com *.googlesyndication.com googlesyndication.com *.googleadservices.com googleadservices.com *.corbado.io corbado.io *.sentry-cdn.com sentry-cdn.com blob: 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.thefemdevs.com; img-src *; font-src *; connect-src *; media-src *; object-src 'none';frame-ancestors *; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content; sandbox allow-forms allow-same-origin allow-scripts; base-uri 'self'; manifest-src 'self'; require-trusted-types-for 'script';")
        .setHeader('Cross-Origin-Opener-Policy', 'same-origin')
        .setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
        .setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
        .setHeader("Document-Policy", "js-profiling")
    return next();
}