const CORS = (data) => {
    let corsStr = '';
    for (const [key, value] of Object.entries(data)) {
        corsStr += `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        const fValue = Object.assign({}, { wildcard: false, domains: [], inititives: [], self: false, none: false }, value);
        if (fValue.none) {
            corsStr += `; `;
            continue;
        }
        if (fValue.wildcard) corsStr += ` *`;
        if (fValue.domains.length > 0) corsStr += ` ${fValue.domains.join(' ')}`;
        if (fValue.inititives.length > 0) corsStr += ` ${fValue.inititives.join(' ')}`;
        if (fValue.self) corsStr += ` 'self'`;
        corsStr += `; `;
    }
    return corsStr.slice(0, -1);
}


/** @type {import('express').RequestHandler} */ module.exports = (req, res, next) => {
    const { platform: os, versions: v } = process;
    res
        .setHeader('X-Repo', 'https://github.com/femdevs/femdev-website')
        .setHeader('X-Live-Deploy', 'https://thefemdevs.com')
        .setHeader('X-Repository-License', 'Affero General Public License v3.0 or newer (AGPL-3.0-or-later)')
        .setHeader('X-OS', os == 'win32' ? 'Windows' : os == 'linux' ? 'Linux' : os == 'darwin' ? 'MacOS' : 'Other')
        .setHeader('X-Node-Version', v.node)
        .setHeader('Content-Security-Policy', CORS({
            defaultSrc: {wildcard: true},
            scriptSrc: {
                self: true,
                domains: [
                    'google.com',
                    '*.google.com',
                    '*.googlesyndication.com',
                    'googlesyndication.com',
                    '*.googleadservices.com',
                    'googleadservices.com',
                    '*.corbado.io',
                    'corbado.io',
                    '*.sentry-cdn.com',
                    'sentry-cdn.com',
                    '*.thefemdevs.com',
                    'fontawesome.com',
                    '*.fontawesome.com',
                    'blob:'
                ],
                inititives: ['unsafe-inline']
            },
            styleSrc: {
                self: true,
                domains: [
                    'fonts.googleapis.com',
                    'cdn.thefemdevs.com',
                    'fontawesome.com',
                    '*.fontawesome.com',
                ],
                inititives: ['unsafe-inline']
            },
            imgSrc: {wildcard: true},
            fontSrc: {wildcard: true},
            connectSrc: {wildcard: true},
            mediaSrc: {wildcard: true},
            objectSrc: {none: true},
            frameSrc: {wildcard: true},
            formAction: {self: true},
            baseUri: {self: true},
            manifestSrc: {self: true},
            requireTrustedTypesFor: {inititives: ['script']}
        }))
        .setHeader('Cross-Origin-Opener-Policy', 'same-origin')
        .setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
        .setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
        .setHeader("Document-Policy", "js-profiling")
    return next();
}