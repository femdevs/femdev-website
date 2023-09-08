const router = require('express').Router();
const bodyParser = require('body-parser');
const SimpleWebAuthnServer = require('@simplewebauthn/server');
const {
    getUser: getUserFromDB,
    saveAuthForUser: saveNewUserAuthenticatorInDB,
    getUserAuthenticators,
} = require('../../functions/passkey');

const challenges = {};

const setUserCurrentChallenge = (user, challenge) => void (challenges[user.firebaseUID] = challenge)

const getUserCurrentChallenge = (user) => challenges[user.firebaseUID];

const rpName = 'FemDevs OAuth2'
const rpId = 'localhost';
const origin = 'http://localhost:3001';

router
    .use(bodyParser.json())
    .get('/test', (req, res) => {
        res.render(
            `auth/register.pug`,
            {
                title: 'Test',
            }
        );
    })
    .get('/get-creds', async (req, res) => {
        const cookies = req.headers.cookie
            .split(';')
            .map(
                cookie =>
                    cookie.split('=')
            )
            .reduce(
                (acc, [key, value]) =>
                    ({ ...acc, [key.trim()]: decodeURIComponent(value) }),
                {}
            );
        const user = await getUserFromDB(cookies['userId']);
        const userAuthenticators = await getUserAuthenticators(user);

        const options = await SimpleWebAuthnServer.generateRegistrationOptions({
            rpName,
            rpID: rpId,
            userID: user.firebaseUID,
            userName: user.displayname,
            attestationType: 'none',
            excludeCredentials: userAuthenticators.map(authenticator => ({
                id: authenticator.credentialID,
                type: 'public-key',
                transports: authenticator.transports,
            })),
        });

        req.session.challenge = options.challenge;

        return res.json(options)
    })
    .post('/verify', async (req, res) => {
        const { body } = req;
        const cookies = req.headers.cookie
            .split(';')
            .map(
                cookie =>
                    cookie.split('=')
            )
            .reduce(
                (acc, [key, value]) =>
                    ({ ...acc, [key.trim()]: decodeURIComponent(value) }),
                {}
            );
        const user = getUserFromDB(cookies['userId']);
        const expectedChallenge = req.session.challenge;

        let verification = (await SimpleWebAuthnServer.verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpId,
        }).catch((error) => {
            console.error(error);
            res.status(400).send({ error: error.message })
            process.exit(1);
        }))

        res.status(200).json({ verified: verification.verified });
        const { registrationInfo } = verification;
        const { credentialPublicKey, credentialID, counter } = registrationInfo;

        const newAuthenticator = {
            credentialID: credentialID.toString('base64'),
            credentialPublicKey,
            counter,
        };

        saveNewUserAuthenticatorInDB(user, newAuthenticator);
    })
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