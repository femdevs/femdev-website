const router = require('express').Router();

router.get(`/f/:file`, (req, res) => {
    const file = req.params.file;
    res.sendFile(`${process.cwd()}/assets/fonts/${file}`);
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
            file: 'toolbox',
            locked: true
        }
    );
})

router.get('/web-gen', (req, res) => {
    res.render(
        `main/website-generator.pug`,
        {
            title: 'Website Generator',
            file: 'website-gen',
            locked: true
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

router.use((req, res, next) => {
    const { path, method } = req;
    const methodUsed = method.toUpperCase();
    let allowedMethods = router.stack
        .filter(r => r.route && r.route.path === path)
    if (allowedMethods.length == 0) return next();

    // find the allowed methods for the path
    allowedMethods
        .map(r => r.route.stack[0])
    allowedMethods = {...allowedMethods[0]}
    allowedMethods = allowedMethods.route.methods;

    if (allowedMethods[methodUsed]) {
        return next();
    } else {
        res.status(405).render(
            `misc/405.pug`,
            {
                title: '405 - Method Not Allowed',
                path,
                allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                methodUsed: methodUsed
            }
        );
    }
})

module.exports = router;