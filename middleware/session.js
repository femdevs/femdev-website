
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const crypto = require('crypto');
const cron = require('node-cron');

let cookieSecrets;

const CSR = cron
    .schedule(
        '0 * * * *',
        () => (cookieSecrets = crypto.randomBytes(32).toString('base64url')),
        {
            name: 'Cookie Secret Rotator',
            recoverMissedExecutions: true,
            runOnInit: true,
            timezone: 'America/Detroit'
        }
    )

CSR.start();

const ISMMS = new MemoryStore(
    {
        checkPeriod: 360_000,
        stale: false
    }
)

const ISM = session(
    {
        secret: cookieSecrets,
        saveUninitialized: true,
        resave: false,
        cookie: {
            maxAge: 3_600_000,
            secure: 'auto'
        },
        store: ISMMS
    }
)

module.exports = ISM