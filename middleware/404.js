/**
 * @type {import('express').RequestHandler}
 */
module.exports = (req, res, _) => {
    req.Sentry.startSpan(
        { op: "404", name: "404 Page Not Found Handler", data: { path: req.path } },
        () => {
            return res.status(404).render(
                `${req.aprilFools()}misc/404.pug`,
                {
                    errData: {
                        path: req.path,
                    },
                    meta: {
                        title: '404 - Page Not Found',
                        desc: '404 - Page Not Found',
                        url: 'https://thefemdevs.com/errors/404'
                    }
                }
            );
        });
};