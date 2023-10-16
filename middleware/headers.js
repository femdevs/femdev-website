const { Octokit } = require('@octokit/rest');

const latestRelease = new Octokit({ auth: process.env.GH_TOKEN }).repos.getLatestRelease({ owner: 'femdevs', repo: 'femdev-website' })

/**
 * @type {import('express').RequestHandler}
 */
module.exports = (req, res, next) => {
    req.Sentry.startSpan(
        { op: "headers", name: "Header Setter", data: { path: req.path } },
        async () => {
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
                .setHeader('X-Node-Version', process.version)
                .setHeader('X-Release', (await latestRelease).data.tag_name)
                .setHeader('X-Latest-Release-URL', (await latestRelease).data.html_url)
                .setHeader('X-Latest-Release-Date', (await latestRelease).data.published_at)
                .setHeader('Content-Security-Policy', "default-src *; script-src 'self' google.com *.google.com *.googlesyndication.com googlesyndication.com *.googleadservices.com googleadservices.com *.corbado.io corbado.io *.sentry-cdn.com sentry-cdn.com blob: 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src *; font-src *; connect-src *; media-src *; object-src 'none';frame-ancestors *; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content; sandbox allow-forms allow-same-origin allow-scripts; base-uri 'self'; manifest-src 'self'; require-trusted-types-for 'script';")
                .setHeader('Cross-Origin-Opener-Policy', 'same-origin')
                .setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
                .setHeader("Document-Policy", "js-profiling")
            return next();
        }
    );
};