const router = require('express').Router();
const bodyParser = require('body-parser');
const SimpleWebAuthnServer = require('@simplewebauthn/server');
const {
    getUser: getUserFromDB,
    getUserAuthenticators,
    updateAuthCounter: saveUpdatedAuthenticatorCounter
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
            `auth/login.pug`,
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
        const userAuthenticators = getUserAuthenticators(user);

        const options = SimpleWebAuthnServer.generateAuthenticationOptions({
            // Require users to use a previously-registered authenticator
            allowCredentials: userAuthenticators.map(authenticator => ({
                id: authenticator.credentialID,
                type: 'public-key',
                // Optional
                transports: authenticator.transports,
            })),
            userVerification: 'preferred',
        });

        // (Pseudocode) Remember this challenge for this user
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
        const user = await getUserFromDB(cookies['userId']);
        const expectedChallenge = getUserCurrentChallenge(user);
        const authenticator = getUserAuthenticators(user, body.id);

        if (!authenticator) throw new Error(`Could not find authenticator ${body.id} for user ${user.id}`);

        let verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpId,
            authenticator,
        }).catch((error) => {
            console.error(error);
            return res.status(400).send({ error: error.message });
        })

        const { verified, authenticationInfo } = verification;
        if (!verified) return res.status(400).send({ error: 'Could not verify authenticator' });
        res.status(200).json({ verified: true });
        const { newCounter } = authenticationInfo;
        saveUpdatedAuthenticatorCounter(authenticator, newCounter);
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