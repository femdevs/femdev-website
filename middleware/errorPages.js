/** @param {import('@sentry/node').NodeClient} sentry @returns {import('express').ErrorRequestHandler} */
module.exports = (sentry) => (function (err, req, res, next) {
    sentry.startSpan(
        { op: "miscRoutes", name: "Misc Routes Handler", data: { path: req.path } },
        () => {
            const errorId = sentry.captureException(err);
            console.log(err)
            res
                .status(501)
                .setHeader('X-Error-ID', errorId)
                .render(
                    `misc/501.pug`,
                    req.getErrPage(501, { errorId })
                )
        }
    )
})