class WebSecurity {
    /** @param {ArrayLike<CSPObj>} CSPs */
    static CSP(CSPs) {
        let corsStr = '';
        for (const info of Array.from(CSPs)) {
            corsStr += `${info.key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            const v = info.getOptions();
            if (v.none) {
                corsStr += `'none'; `;
                continue;
            }
            if (v.inititives.length > 0) corsStr += ` ${v.inititives.map(i => `'${i}'`).join(' ')}`
            if (v.self) corsStr += ` 'self'`;
            if (v.wildcard) corsStr += ` *`;
            if (v.domains.length > 0) corsStr += ` ${v.domains.join(' ')}`;
            corsStr += `; `;
        }
        return corsStr.trim();
    }
    static CORS(data) {
        const CORSPolicies = {
            allowOrigin: { wildcard: false, domain: '' },
            exposeHeaders: { wildcard: false, headers: [] },
            maxAge: 0,
            allowCredentials: false,
            allowMethods: [],
            allowHeaders: [],
            openerPolicy: 'same-origin',
            resourcePolicy: 'cross-origin',
            embedderPolicy: 'require-corp',
        }
        const fData = Object.assign({}, CORSPolicies, data);
        const Headers = new Set();
        Headers.add(['Access-Control-Allow-Origin', (fData.allowOrigin.domain) ? fData.allowOrigin.domain : '*']);
        Headers.add(['Access-Control-Expose-Headers', (fData.exposeHeaders.headers.length > 0) ? fData.exposeHeaders.headers.join(', ') : '*']);
        Headers.add(['Access-Control-Max-Age', fData.maxAge]);
        Headers.add(['Access-Control-Allow-Credentials', fData.allowCredentials]);
        Headers.add(['Access-Control-Allow-Methods', (fData.allowMethods.length > 0) ? fData.allowMethods.join(', ') : '*']);
        Headers.add(['Access-Control-Allow-Headers', (fData.allowHeaders.length > 0) ? fData.allowHeaders.join(', ') : '*']);
        Headers.add(['Cross-Origin-Opener-Policy', fData.openerPolicy]);
        Headers.add(['Cross-Origin-Resource-Policy', fData.resourcePolicy]);
        Headers.add(['Cross-Origin-Embedder-Policy', fData.embedderPolicy]);
        return Array.from(Headers);
    }
    static HSTS(data) {
        const HSTSPolicies = {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: false
        }
        const fData = Object.assign({}, HSTSPolicies, data);
        return `max-age=${fData.maxAge}${(fData.includeSubDomains) ? '; includeSubDomains' : ''}${(fData.preload) ? '; preload' : ''}`;
    }
    static CD = (domain) => [domain, `*.${domain}`];
}

class CSPObj {
    /**
     * @param {string} key 
     * @param {{none?: boolean, inititives?: Array<string>, self?: boolean, wildcard?: boolean, domains?: Array<string>}} data 
     */
    constructor(key, data) {
        this.key = key;
        this.none = data.none ?? false;
        this.inititives = data.inititives ?? [];
        this.self = data.self ?? false;
        this.wildcard = data.wildcard ?? false;
        this.domains = data.domains ?? [];
    }
    getOptions() {
        return {
            none: this.none,
            inititives: this.inititives,
            self: this.self,
            wildcard: this.wildcard,
            domains: this.domains
        }
    }
}

const CSPs = new Set()
    .add(new CSPObj('defaultSrc', { wildcard: true }))
    .add(new CSPObj('scriptSrc', { self: true, domains: ['blob:'].concat(WebSecurity.CD('google.com'), WebSecurity.CD('thefemdevs.com'), WebSecurity.CD('fontawesome.com')), inititives: ['unsafe-inline', 'unsafe-eval'] }))
    .add(new CSPObj('styleSrc', { self: true, domains: [].concat(WebSecurity.CD('google.com'), WebSecurity.CD('googleapis.com'), WebSecurity.CD('thefemdevs.com'), WebSecurity.CD('fontawesome.com')), inititives: ['unsafe-inline', 'unsafe-eval'] }))
    .add(new CSPObj('imgSrc', { wildcard: true }))
    .add(new CSPObj('fontSrc', { wildcard: true }))
    .add(new CSPObj('connectSrc', { wildcard: true }))
    .add(new CSPObj('mediaSrc', { wildcard: true }))
    .add(new CSPObj('objectSrc', { none: true }))
    .add(new CSPObj('frameSrc', { wildcard: true }))
    .add(new CSPObj('formAction', { self: true }))
    .add(new CSPObj('baseUri', { self: true }))
    .add(new CSPObj('manifestSrc', { self: true }))
    .add(new CSPObj('requireTrustedTypesFor', { inititives: ['script'] }))
    .add(new CSPObj('report-to', { domains: ['csp'] }));

/** @type {import('express').RequestHandler} */
module.exports = (req, res, next) => {
    const { platform: os, versions: v } = process;
    res
        .setHeader('X-Repo', 'https://github.com/femdevs/femdev-website')
        .setHeader('X-Live-Deploy', 'https://thefemdevs.com')
        .setHeader('X-Repository-License', 'Affero General Public License v3.0 or newer (AGPL-3.0-or-later)')
        .setHeader('X-OS', os == 'win32' ? 'Windows' : os == 'linux' ? 'Linux' : os == 'darwin' ? 'MacOS' : 'Other')
        .setHeader('X-Node-Version', v.node)
        .setHeader('Report-To', JSON.stringify({ group: 'csp', max_age: 10886400, endpoints: [{ url: 'https://security.thefemdevs.com/csp/new' }] }))
        .setHeader('Content-Security-Policy', WebSecurity.CSP(CSPs))
        .setHeader('Strict-Transport-Security', WebSecurity.HSTS({ maxAge: 31536000, includeSubDomains: true, preload: true }))
    WebSecurity.CORS({
        maxAge: 86400,
        allowCredentials: true,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-HTTP-Method-Override', 'Accept', 'Origin']
    }).forEach(([key, value]) => res.setHeader(key, value));
    return next();
}