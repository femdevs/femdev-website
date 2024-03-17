const router = require('express').Router();

router
    .get('/', async (req, res) => res.render(
        'pages/oblong/index.pug',
        {
            status: (await req.Database.getServerStatus()),
            meta: {
                title: 'Oblongs\'s Official Website',
                desc: 'The official website of Oblong!',
                url: 'https://oblong.thefemdevs.com',
            }
        }
    ))
    .get('/cdn/img/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/oblong/imgs/${req.params.file}`))
    .get('/cdn/js/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/oblong/js/${req.params.file}.js`))
    .get('/cdn/css/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/oblong/css/${req.params.file}.css`));

module.exports = router;