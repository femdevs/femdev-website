/** @type {import('express').ErrorRequestHandler} */
module.exports = (err, req, res, next) => {
    console.log(err)
    res
        .status(501)
        .setHeader('X-Error-ID', '')
        .render(
            `misc/501.pug`,
            req.getErrPage(501, { errorId: '' })
        )
}