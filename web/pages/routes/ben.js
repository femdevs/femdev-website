const router = require('express').Router();

router
    .get('/', async (req, res) => res.render(
        'pages/ben/index.pug',
        {
            status: (await req.Database.getServerStatus()),
            meta: {
                title: 'Benpai\'s Official Website',
                desc: 'The official website of Benpai!',
                url: 'https://ben.thefemdevs.com',
            }
        }
    ))
    .get('/cdn/img/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/ben/imgs/${req.params.file}`))
    .get('/cdn/js/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/ben/js/${req.params.file}.js`))
    .get('/cdn/css/:file', (req, res) => res.sendFile(`${process.cwd()}/web/pages/assets/ben/css/${req.params.file}.css`));

module.exports = router;