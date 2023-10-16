/**
 * @type {import('express').ErrorRequestHandler}
 */
module.exports = (err, req, res, next) => {
    req.Sentry.startSpan(
        { op: "miscRoutes", name: "Misc Routes Handler", data: { path: req.path } },
        () => {
            switch (err.status) {
                case 401:
                case 403:
                    return res.status(err.status).render(
                        `${req.aprilFools()}misc/401.pug`,
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
                //         `${req.aprilFools()}misc/405.pug`,
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
                    const errorId = req.Sentry.captureException(err);
                    console.log(err)
                    res
                        .status(501)
                        .setHeader('X-Error-ID', errorId)
                        .render(
                            `${req.aprilFools()}misc/501.pug`,
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
};