class WebSecurity {
    static CSP(data) {
        let corsStr = '';
        for (const [key, value] of Object.entries(data)) {
            corsStr += `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            const fValue = Object.assign({}, { wildcard: false, domains: [], inititives: [], self: false, none: false }, value);
            if (fValue.none) {
                corsStr += `'none'; `;
                continue;
            }
            if (fValue.inititives.length > 0) corsStr += ` ${fValue.inititives.join(' ')}`;
            if (fValue.self) corsStr += ` 'self'`;
            if (fValue.wildcard) corsStr += ` *`;
            if (fValue.domains.length > 0) corsStr += ` ${fValue.domains.join(' ')}`;
            corsStr += `; `;
        }
        return corsStr.slice(0, -1);
    }
    static CORS(data) {
        const CORSPolicies = {
            allowOrigin: { wildcard: false, domain: '' },
            exposeHeaders: { wildcard: false, headers: [] },
            maxAge: 0,
            allowCredentials: false,
            allowMethods: [],
            allowHeaders: []
        }
        const fData = Object.assign({}, CORSPolicies, data);
        const Headers = new Set();
        Headers.add(['Access-Control-Allow-Origin', (fData.allowOrigin.domain) ? fData.allowOrigin.domain : '*']);
        Headers.add(['Access-Control-Expose-Headers', (fData.exposeHeaders.headers.length > 0) ? fData.exposeHeaders.headers.join(', ') : '*']);
        Headers.add(['Access-Control-Max-Age', fData.maxAge]);
        Headers.add(['Access-Control-Allow-Credentials', fData.allowCredentials]);
        Headers.add(['Access-Control-Allow-Methods', (fData.allowMethods.length > 0) ? fData.allowMethods.join(', ') : '*']);
        Headers.add(['Access-Control-Allow-Headers', (fData.allowHeaders.length > 0) ? fData.allowHeaders.join(', ') : '*']);
        return Array.from(Headers);
    }
}

/** @type {import('express').RequestHandler} */ module.exports = (req, res, next) => {
    const { platform: os, versions: v } = process;
    res
        .setHeader('X-Repo', 'https://github.com/femdevs/femdev-website')
        .setHeader('X-Live-Deploy', 'https://thefemdevs.com')
        .setHeader('X-Repository-License', 'Affero General Public License v3.0 or newer (AGPL-3.0-or-later)')
        .setHeader('X-OS', os == 'win32' ? 'Windows' : os == 'linux' ? 'Linux' : os == 'darwin' ? 'MacOS' : 'Other')
        .setHeader('X-Node-Version', v.node)
        .setHeader('Content-Security-Policy', WebSecurity.CSP({
            defaultSrc: { wildcard: true },
            scriptSrc: {
                self: true,
                domains: [
                    '*.google.com',
                    'google.com',
                    '*.googlesyndication.com',
                    'googlesyndication.com',
                    '*.googleadservices.com',
                    'googleadservices.com',
                    '*.corbado.io',
                    'corbado.io',
                    '*.sentry-cdn.com',
                    'sentry-cdn.com',
                    '*.thefemdevs.com',
                    'thefemdevs.com',
                    '*.fontawesome.com',
                    'fontawesome.com',
                    'blob:'
                ],
                inititives: ['unsafe-inline', 'unsafe-eval']
            },
            styleSrc: {
                self: true,
                domains: [
                    "*.google.com",
                    "google.com",
                    "*.googleapis.com",
                    'fonts.googleapis.com',
                    '*.thefemdevs.com',
                    'thefemdevs.com',
                    '*.fontawesome.com',
                    'fontawesome.com',
                ],
                inititives: ['unsafe-inline', 'unsafe-eval']
            },
            imgSrc: { wildcard: true },
            fontSrc: { wildcard: true },
            connectSrc: { wildcard: true },
            mediaSrc: { wildcard: true },
            objectSrc: { none: true },
            frameSrc: { wildcard: true },
            formAction: { self: true },
            baseUri: { self: true },
            manifestSrc: { self: true },
            requireTrustedTypesFor: { inititives: ['script'] }
        }))
        .setHeader('Cross-Origin-Opener-Policy', 'same-origin')
        .setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
        .setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
        .setHeader("Document-Policy", "js-profiling")
    WebSecurity.CORS({
        maxAge: 86400,
        allowCredentials: true,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-HTTP-Method-Override', 'Accept', 'Origin']
    }).forEach(([key, value]) => res.setHeader(key, value));
    return next();
}