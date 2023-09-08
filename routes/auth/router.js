const router = require('express').Router();
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

const reg = require('./reg');
const login = require('./login');

router
    .use(session({
        secret: 'secret123',
        saveUninitialized: true,
        resave: false,
        cookie: {
            maxAge: 86400000,
            httpOnly: true, // Ensure to not expose session cookies to clientside scripts
        },
        store: new MemoryStore({
            checkPeriod: 86_400_000, // prune expired entries every 24h
        }),
    }))
    .use('/register', reg)
    .use('/login', login)
    .use((req, res, next) => {
        const { path, method } = req;
        const methodUsed = method.toUpperCase();
        let allowedMethods = router.stack
            .filter(r => r.route && r.route.path === path)
        if (allowedMethods.length == 0) return next();

        // find the allowed methods for the path
        allowedMethods
            .map(r => r.route.stack[0])
        allowedMethods = { ...allowedMethods[0] }
        allowedMethods = allowedMethods.route.methods;

        if (allowedMethods[methodUsed]) return next();
        else {
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