const {NodeClient} = require('@sentry/node');
const { ErrorRequestHandler } = require('express');

/**
 * @param {NodeClient} sentry
 * @returns {ErrorRequestHandler}
 */
module.exports = (sentry) => (function (err, req, res, next) {
        sentry.startSpan(
            { op: "miscRoutes", name: "Misc Routes Handler", data: { path: req.path } },
            () => {
                switch (err.status) {
                    case 401:
                    case 403:
                        return res.status(err.status).render(
                            `misc/401.pug`,
                            {
                                errData: {
                                    path: req.path,
                                    code: err.status,
                                },
                                meta: {
                                    title: `401 - Unauthorized`,
                                    desc: `401 - Unauthorized`,
                                    url: `https://thefemdevs.com/errors/401`
                                }
                            }
                        );
                    // case 405:
                    //     const allowedMethods = [];
                    //     const methodUsed = req.method.toLowerCase();
                    //     const { path } = req;
                    //     router.stack.forEach((r) => {
                    //         if (r.route && r.route.path === path) {
                    //             allowedMethods.push(r.route.stack[0].method.toLowerCase());
                    //         }
                    //     })
                    //     res.status(405).render(
                    //         `misc/405.pug`,
                    //         {
                    //             errData: {
                    //                 path,
                    //                 allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                    //                 methodUsed: methodUsed,
                    //             },
                    //             meta: {
                    //                 title: '405 - Method Not Allowed',
                    //                 desc: '405 - Method Not Allowed',
                    //                 url: 'https://thefemdevs.com/errors/405',
                    //             }
                    //         }
                    //     );
                    case 404:
                        break;
                    default:
                        const errorId = sentry.captureException(err);
                        console.log(err)
                        res
                            .status(501)
                            .setHeader('X-Error-ID', errorId)
                            .render(
                                `misc/501.pug`,
                                {
                                    errData: {
                                        errorId
                                    },
                                    meta: {
                                        title: `501 - Internal Server Error`,
                                        desc: `501 - Internal Server Error`,
                                        url: `https://thefemdevs.com/errors/501`
                                    }
                                }
                            )
                        break;
                }
                return next();
            }
        )
})