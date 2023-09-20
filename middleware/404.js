const { aprilFools } = require('../functions/utilities');

const four0four = (req, res) => {
    res.status(404).render(
        `${aprilFools() ? 'april-fools/' : ''}misc/404.pug`,
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
}

module.exports = four0four;