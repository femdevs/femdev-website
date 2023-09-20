const headers = (_, res, next) => {
    res
        .setHeader('X-Repo', 'https://github.com/femdevs/femdev-website')
        .setHeader('X-Live-Deploy', 'https://thefemdevs.com')
        .setHeader('X-Repository-License', 'Affero General Public License v3.0 or newer (AGPL-3.0-or-later)')
        .setHeader(
            'X-OS',
            process.platform == 'win32' ? 'Windows' :
                process.platform == 'linux' ? 'Linux' :
                    process.platform == 'darwin' ? 'MacOS' :
                        'Other'
        )
        .setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' google.com *.google.com *.googlesyndication.com googlesyndication.com *.googleadservices.com googleadservices.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src *; font-src *; connect-src *; media-src *; object-src 'none'; child-src *; worker-src 'none'; frame-ancestors *; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content; sandbox allow-forms allow-same-origin allow-scripts; base-uri 'self'; manifest-src 'self'; require-trusted-types-for 'script';")
        .setHeader('Cross-Origin-Opener-Policy', 'same-origin')
        .setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
        .removeHeader('X-Powered-By');
    next();
}

module.exports = headers;