const WS = require('@therealbenpai/zdcors');

/** @type {import('express').RequestHandler} */
module.exports = (req, res, next) => {
    const { platform: os, versions: v } = process;
    res
        .setHeader('Report-To', WS.WebSecurity.ReportTo(
            new WS.ReportToGroup('csp-ep', 31536000, ['csp', 'report'].map(g => `https://security.thefemdevs.com/${g}/new`))
        ))
        .setHeader('Content-Security-Policy', WS.WebSecurity.CSP(
            new WS.CSPObj('imgSrc', new WS.CSPObjData(false, [], false, true, [])),
            new WS.CSPObj('fontSrc', new WS.CSPObjData(false, [], false, true, [])),
            new WS.CSPObj('mediaSrc', new WS.CSPObjData(false, [], false, true, [])),
            new WS.CSPObj('childSrc', new WS.CSPObjData(false, [], false, true, [])),
            new WS.CSPObj('objectSrc', new WS.CSPObjData(true, [], false, false, [])),
            new WS.CSPObj('defaultSrc', new WS.CSPObjData(false, [], false, true, [])),
            new WS.CSPObj('connectSrc', new WS.CSPObjData(false, [], false, true, [])),
            new WS.CSPObj('formAction', new WS.CSPObjData(false, [], true, false, [])),
            new WS.CSPObj('prefetchSrc', new WS.CSPObjData(false, [], false, true, [])),
            new WS.CSPObj('manifestSrc', new WS.CSPObjData(false, [], true, false, [])),
            new WS.CSPObj('reportTo', new WS.CSPObjData(false, [], false, false, ['csp-ep'])),
            new WS.CSPObj('blockAllMixedContent', new WS.CSPObjData(false, [], false, false, [])),
            new WS.CSPObj('upgradeInsecureRequests', new WS.CSPObjData(false, [], false, false, [])),
            new WS.CSPObj('requireTrustedTypesFor', new WS.CSPObjData(false, ['script'], false, false, [])),
            new WS.CSPObj('reportUri', new WS.CSPObjData(false, [], false, false, ['https://security.thefemdevs.com/csp/new'])),
            new WS.CSPObj('baseUri', new WS.CSPObjData(false, [], true, false, ['thefemdevs.com', 'security.thefemdevs.com', 'cdn.thefemdevs.com'])),
            new WS.CSPObj('scriptSrc', new WS.CSPObjData(false, ['unsafe-inline', 'unsafe-eval'], true, false, ['blob:', ...WS.WebSecurity.CD('thefemdevs.com'), ...WS.WebSecurity.CD('google.com'), ...WS.WebSecurity.CD('fontawesome.com')])),
            new WS.CSPObj('scriptSrcElem', new WS.CSPObjData(false, ['unsafe-inline', 'unsafe-eval'], true, false, ['blob:', ...WS.WebSecurity.CD('thefemdevs.com'), ...WS.WebSecurity.CD('google.com'), ...WS.WebSecurity.CD('fontawesome.com')])),
            new WS.CSPObj('styleSrc', new WS.CSPObjData(false, ['unsafe-inline'], true, false, [].concat(WS.WebSecurity.CD('google.com'), WS.WebSecurity.CD('googleapis.com'), WS.WebSecurity.CD('thefemdevs.com'), WS.WebSecurity.CD('fontawesome.com')))),
            new WS.CSPObj('styleSrcElem', new WS.CSPObjData(false, ['unsafe-inline'], true, false, [].concat(WS.WebSecurity.CD('google.com'), WS.WebSecurity.CD('googleapis.com'), WS.WebSecurity.CD('thefemdevs.com'), WS.WebSecurity.CD('fontawesome.com')))),
        ))
        .setHeader('Permissions-Policy', WS.WebSecurity.PermissionPolicy(
            new WS.PermissionPolicy('hid', { none: true }),
            new WS.PermissionPolicy('usb', { none: true }),
            new WS.PermissionPolicy('midi', { none: true }),
            new WS.PermissionPolicy('camera', { none: true }),
            new WS.PermissionPolicy('serial', { none: true }),
            new WS.PermissionPolicy('battery', { none: true }),
            new WS.PermissionPolicy('gamepad', { none: true }),
            new WS.PermissionPolicy('autoplay', { none: true }),
            new WS.PermissionPolicy('webShare', { self: true }),
            new WS.PermissionPolicy('bluetooth', { none: true }),
            new WS.PermissionPolicy('gyroscope', { none: true }),
            new WS.PermissionPolicy('fullscreen', { self: true }),
            new WS.PermissionPolicy('magnetometer', { none: true }),
            new WS.PermissionPolicy('accelerometer', { none: true }),
            new WS.PermissionPolicy('idleDetection', { none: true }),
            new WS.PermissionPolicy('browsingTopics', { none: true }),
            new WS.PermissionPolicy('localFonts', { wildcard: true }),
            new WS.PermissionPolicy('screenWakeLock', { none: true }),
            new WS.PermissionPolicy('display-capture', { none: true }),
            new WS.PermissionPolicy('document-domain', { none: true }),
            new WS.PermissionPolicy('encrypted-media', { none: true }),
            new WS.PermissionPolicy('windowManagement', { none: true }),
            new WS.PermissionPolicy('xrSpacialTracking', { none: true }),
            new WS.PermissionPolicy('ambientLightSensor', { none: true }),
            new WS.PermissionPolicy('executionWhileNotRendered', { none: true }),
            new WS.PermissionPolicy('executionWhileOutOfViewport', { none: true }),
            new WS.PermissionPolicy('microphone', { self: true, domains: WS.WebSecurity.CD('thefemdevs.com') }),
            new WS.PermissionPolicy('storageAccess', { self: true, domains: WS.WebSecurity.CD('thefemdevs.com') }),
            new WS.PermissionPolicy('otpCredentials', { self: true, domains: WS.WebSecurity.CD('thefemdevs.com') }),
            new WS.PermissionPolicy('pictureInPicture', { self: true, domains: WS.WebSecurity.CD('thefemdevs.com') }),
            new WS.PermissionPolicy('speakerSelection', { self: true, domains: WS.WebSecurity.CD('thefemdevs.com') }),
            new WS.PermissionPolicy('identityCredentialsGet', { self: true, domains: WS.WebSecurity.CD('thefemdevs.com') }),
            new WS.PermissionPolicy('publickeyCredentialsGet', { self: true, domains: WS.WebSecurity.CD('thefemdevs.com') }),
            new WS.PermissionPolicy('publickeyCredentialsCreate', { self: true, domains: WS.WebSecurity.CD('thefemdevs.com') }),
            new WS.PermissionPolicy('payment', { self: true, domains: [].concat(WS.WebSecurity.CD('thefemdevs.com'), WS.WebSecurity.CD('stripe.com')) }),
            new WS.PermissionPolicy('geolocation', { self: true, domains: [].concat(WS.WebSecurity.CD('google.com'), WS.WebSecurity.CD('googleapis.com'), WS.WebSecurity.CD('thefemdevs.com')) }),
        ))
        .setHeader('Reporting-Endpoints', WS.WebSecurity.ReportingEndpoints(
            new WS.ReportingEndpoint('csp-ep', 'https://security.thefemdevs.com/csp/new'),
            new WS.ReportingEndpoint('doc-ep', 'https://security.thefemdevs.com/doc/new'),
            new WS.ReportingEndpoint('default', 'https://security.thefemdevs.com/report/new'),
        ))
        .setHeader('X-Node-Version', v.node)
        .setHeader('X-Frame-Options', 'SAMEORIGIN')
        .setHeader('Referrer-Policy', 'same-origin')
        .setHeader('X-Content-Type-Options', 'nosniff')
        .setHeader('X-Live-Deploy', 'https://thefemdevs.com')
        .setHeader('X-Repo', 'https://github.com/femdevs/femdev-website')
        .setHeader('NEL', '{"report_to":"default","max_age":31536000,"include_subdomains":true}')
        .setHeader('Strict-Transport-Security', WS.WebSecurity.HSTS({ ma: 31536000, iSD: true, pl: true }))
        .setHeader('X-Repository-License', 'Affero General Public License v3.0 or newer (AGPL-3.0-or-later)')
        .setHeader('X-OS', os == 'win32' ? 'Windows' : os == 'linux' ? 'Linux' : os == 'darwin' ? 'MacOS' : 'Other')
        .setHeader('Document-Policy', 'unsized-media=?0, document-write=?0, max-image-bpp=2.0, frame-loading=lazy, report-to=doc-ep')
    WS.WebSecurity.CORS({
        maxAge: 86400,
        allowCredentials: true,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-HTTP-Method-Override', 'Accept', 'Origin']
    }, {}).forEach(([key, value]) => res.setHeader(key, value));
    return next();
}