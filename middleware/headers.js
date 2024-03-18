class WebSecurity {
    /** @param {Array<CSPObj>} CSPs */
    static CSP = (...CSPs) => CSPs
        .reduce((acc, info) => acc += ` ${info.key.replace(/([A-Z])/g, '-$1').toLowerCase()
            }${(info.none)
                ? " 'none'"
                : `${(info.inititives.length > 0) ? ` ${info.inititives.map(i => `'${i}'`).join(' ')}` : ''
                }${(info.self) ? ' \'self\'' : ''
                }${(info.wildcard) ? ' *' : ''
                }${(info.domains.length > 0) ? ` ${info.domains.join(' ')}` : ''
                }`
            };`, '');
    static CORS = (accessControl, crossOrigin) => [
        ['Access-Control-Expose-Headers', (Array.isArray(accessControl.exposeHeaders) && accessControl.exposeHeaders) ? accessControl.exposeHeaders.join(', ') : '*'],
        ['Access-Control-Allow-Methods', (Array.isArray(accessControl.allowMethods) && accessControl.allowMethods) ? accessControl.allowMethods.join(', ') : '*'],
        ['Access-Control-Allow-Headers', (Array.isArray(accessControl.allowHeaders) && accessControl.allowHeaders) ? accessControl.allowHeaders.join(', ') : '*'],
        ['Access-Control-Max-Age', accessControl.maxAge || 0],
        ['Access-Control-Allow-Origin', accessControl.allowOrigin || '*'],
        ['Access-Control-Allow-Credentials', accessControl.allowCredentials ?? false],
        ['Cross-Origin-Opener-Policy', crossOrigin.openerPolicy || 'cross-origin'],
        ['Cross-Origin-Resource-Policy', crossOrigin.resourcePolicy || 'cross-origin'],
        ['Cross-Origin-Embedder-Policy', crossOrigin.embedderPolicy || 'require-corp']
    ];
    /** @param {{ma: number, iSD: boolean, pl: boolean}} data */
    static HSTS = (data) => `max-age=${data.ma || 31536000}${(data.iSD) ? '; includeSubDomains' : ''}${(data.pl) ? '; preload' : ''}`;
    /** @param {Array<ReportToGroup>} data */
    static ReportTo = (...data) => data.map(g => JSON.stringify({ group: g.group, max_age: g.max_age, endpoints: g.endpoints })).join(', ');
    /** @param {Array<ReportingEndpoint>} data */
    static ReportingEndpoints = (...data) => data.reduce((acc, ep) => acc += `${ep.id.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${ep.url}, `, '').slice(0, -2);
    /** @param {string} domain */
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
}

class CSPObjData {
    /**
     * @param {boolean} none 
     * @param {Array<string>} inititives 
     * @param {boolean} self 
     * @param {boolean} wildcard 
     * @param {Array<string>} domains 
     */
    constructor(none, inititives, self, wildcard, domains) {
        this.none = none;
        this.inititives = inititives;
        this.self = self;
        this.wildcard = wildcard;
        this.domains = domains;
    }
}

class ReportToGroup {
    /**
     * @param {string} group 
     * @param {number} max_age 
     * @param {Array<string>} endpoints 
     */
    constructor(group, max_age, endpoints) {
        this.group = group;
        this.max_age = max_age;
        this.endpoints = endpoints;
    }
}

class ReportingEndpoint {
    /**
     * @param {string} id 
     * @param {string} url 
     */
    constructor(id, url) {
        this.id = id;
        this.url = url;
    }
}

/** @type {import('express').RequestHandler} */
module.exports = (req, res, next) => {
    const { platform: os, versions: v } = process;
    res
        .setHeader('X-Repo', 'https://github.com/femdevs/femdev-website')
        .setHeader('X-Live-Deploy', 'https://thefemdevs.com')
        .setHeader('X-Repository-License', 'Affero General Public License v3.0 or newer (AGPL-3.0-or-later)')
        .setHeader('X-OS', os == 'win32' ? 'Windows' : os == 'linux' ? 'Linux' : os == 'darwin' ? 'MacOS' : 'Other')
        .setHeader('X-Node-Version', v.node)
        .setHeader('Report-To', WebSecurity.ReportTo(
            new ReportToGroup('csp-ep', 31536000, ['csp', 'report'].map(g => `https://security.thefemdevs.com/${g}/new`))
        ))
        .setHeader('Reporting-Endpoints', WebSecurity.ReportingEndpoints(
            new ReportingEndpoint('csp-ep', 'https://security.thefemdevs.com/csp/new'),
            new ReportingEndpoint('doc-ep', 'https://security.thefemdevs.com/doc/new'),
            new ReportingEndpoint('default', 'https://security.thefemdevs.com/report/new')
        ))
        .setHeader('Content-Security-Policy', WebSecurity.CSP(
            new CSPObj('imgSrc', new CSPObjData(false, [], false, true, [])),
            new CSPObj('fontSrc', new CSPObjData(false, [], false, true, [])),
            new CSPObj('baseUri', new CSPObjData(false, [], true, false, [])),
            new CSPObj('mediaSrc', new CSPObjData(false, [], false, true, [])),
            new CSPObj('frameSrc', new CSPObjData(false, [], false, true, [])),
            new CSPObj('objectSrc', new CSPObjData(true, [], false, false, [])),
            new CSPObj('defaultSrc', new CSPObjData(false, [], false, true, [])),
            new CSPObj('connectSrc', new CSPObjData(false, [], false, true, [])),
            new CSPObj('formAction', new CSPObjData(false, [], true, false, [])),
            new CSPObj('manifestSrc', new CSPObjData(false, [], true, false, [])),
            new CSPObj('reportTo', new CSPObjData(false, [], false, false, ['csp-ep'])),
            new CSPObj('requireTrustedTypesFor', new CSPObjData(false, ['script'], false, false, [])),
            new CSPObj('reportUri', new CSPObjData(false, [], false, false, ['https://security.thefemdevs.com/csp/new'])),
            new CSPObj('scriptSrc', new CSPObjData(false, ['unsafe-inline', 'unsafe-eval'], true, false, ['blob:'].concat(WebSecurity.CD('google.com'), WebSecurity.CD('thefemdevs.com'), WebSecurity.CD('fontawesome.com')))),
            new CSPObj('styleSrc', new CSPObjData(false, ['unsafe-inline', 'unsafe-eval'], true, false, [].concat(WebSecurity.CD('google.com'), WebSecurity.CD('googleapis.com'), WebSecurity.CD('thefemdevs.com'), WebSecurity.CD('fontawesome.com')))),
        ))
        .setHeader('Document-Policy', 'unsized-media=?0, document-write=?0, max-image-bpp=2.0, frame-loading=lazy, report-to=doc-ep')
        .setHeader('Strict-Transport-Security', WebSecurity.HSTS({ ma: 31536000, iSD: true, pl: true }))
    WebSecurity.CORS({
        maxAge: 86400,
        allowCredentials: true,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-HTTP-Method-Override', 'Accept', 'Origin']
    }, {}).forEach(([key, value]) => res.setHeader(key, value));
    return next();
}