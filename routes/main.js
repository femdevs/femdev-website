const express = require('express');
const router = express.Router();

router.get(`/css/d`, (req, res) => { res.sendFile(`${process.cwd()}/assets/stylesheets/general/combined.css`) });

router.get(`/css/c/:file`, (req, res) => {
    const file = req.params.file;
    res.sendFile(`${process.cwd()}/assets/stylesheets/general/${file}.css`);
});

router.get(`/css/f/:file`, (req, res) => {
    const file = req.params.file;
    res.sendFile(`${process.cwd()}/assets/stylesheets/file-specific/${file}.css`);
});

router.get(`/js/fs/:file`, (req, res) => {
    const file = req.params.file;
    res.sendFile(`${process.cwd()}/assets/scripts/File-Specific/${file}`);
});

router.get(`/js/cg/:file`, (req, res) => {
    const file = req.params.file;
    res.sendFile(`${process.cwd()}/assets/scripts/CoG/${file}`);
});

router.get(`/js/o/:file`, (req, res) => {
    const file = req.params.file;
    res.sendFile(`${process.cwd()}/assets/scripts/Other/${file}`);
});

router.get(`/f/:file`, (req, res) => {
    const file = req.params.file;
    res.sendFile(`${process.cwd()}/assets/fonts/${file}`);
});

router.get(`/icon`, (req, res) => {
    res
        .setHeader('Cache-Control', 'no-cache')
        .setHeader(`Content-Type`, `image/x-icon`)
        .sendFile(`${process.cwd()}/assets/media/images/icon.ico`)
});

router.get(`/bg`, (req, res) => {
    res
        .setHeader('Cache-Control', 'no-cache')
        .setHeader(`Content-Type`, `image/svg+xml`)
        .sendFile(`${process.cwd()}/assets/media/images/background.svg`)
});

router.get(`/robots.txt`, (req, res) => {
    res
        .sendFile(`${process.cwd()}/metadata/robots.txt`)
});

router.get(`/sitemap`, (req, res) => {
    res
        .setHeader(`Content-Type`, `application/xml`)
        .sendFile(`${process.cwd()}/metadata/sitemap.xml`)
});

router.get(`/thumbnail`, (req, res) => {
    res
        .setHeader('Cache-Control', 'no-cache')
        .redirect("https://cdn.discordapp.com/attachments/999266213697945652/1081273691867992124/image.png")
});

router.get('/favicon.ico', (req, res) => {
    res
        .setHeader('Cache-Control', 'no-cache')
        .sendFile(`${process.cwd()}/assets/media/images/icon.ico`)
});

router.get('/blank', (req, res) => {
    res.render(
        `main/blank.pug`,
        {
            title: "Blank",
        }
    );
});

router.get('/socials', (req, res) => {
    res.render(
        `main/socials.pug`,
        {
            title: 'Socials',
            page: 2,
            file: 'socials'
        }
    );
})

router.get('/toolbox', (req, res) => {
    res.render(
        `main/toolbox.pug`,
        {
            title: 'Developmental Toolbox',
            file: 'toolbox'
        }
    );
})

router.get('/web-gen', (req, res) => {
    res.render(
        `main/website-generator.pug`,
        {
            title: 'Website Generator',
            file: 'website-generator',
        }
    );
})

router.get('/index', (req, res) => {
    res.render(
        `main/index.pug`,
        {
            title: 'Homepage',
            page: 1,
            file: 'index'
        }
    );
})

router.get(`/`, (req, res) => {
    res.render(
        `main/index.pug`,
        {
            title: 'Homepage',
            page: 1,
            file: 'index'
        }
    );
});

module.exports = router;