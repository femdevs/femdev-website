const router = require('express').Router();
const bodyParser = require('body-parser');
const SimpleWebAuthnServer = require('@simplewebauthn/server');
const { isoBase64URL, isoUint8Array } = require('@simplewebauthn/server/helpers');
const {
    getUser: getUserFromDB,
    getUserAuthenticators,
    updateAuthCounter: saveUpdatedAuthenticatorCounter,
    getUserAuthenticator,
} = require('../../functions/passkey');

const rpId = (process.env === "PRODUCTION") ? 'thefemdevs' : 'localhost';
const origin = (process.env === "PRODUCTION") ? 'https://thefemdevs.com' : 'http://localhost:3001';

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
        const user = await getUserFromDB('CgomRVx547O56mqNCQmmo0VqgW72');
        const userAuthenticators = await getUserAuthenticators(user, rpId);

        const options = await SimpleWebAuthnServer.generateAuthenticationOptions({
            allowCredentials: userAuthenticators.
                map(
                    ({ credentialID, transports }) =>
                        ({ id: isoUint8Array.fromUTF8String(credentialID), type: 'public-key', transports })
                ),
            userVerification: 'preferred',
        });

        // (Pseudocode) Remember this challenge for this user
        req.session.challenge = options.challenge;

        return res.json(options)
    })
    .post('/verify', async (req, res) => {
        const { body } = req;
        const user = await getUserFromDB('CgomRVx547O56mqNCQmmo0VqgW72');
        const expectedChallenge = req.session.challenge;
        const authenticator = await getUserAuthenticator(user, body.id);

        if (!authenticator) throw new Error(`Could not find authenticator ${body.id} for user ${user.id}`);

        let verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpId,
            authenticator: {
                counter: authenticator.counter,
                credentialID: authenticator.credentialID,
                credentialPublicKey: authenticator.credentialPublicKey,
                transports: authenticator.transports,
            },
        }).catch((error) => {
            console.error(error);
            return res.status(400).send({ error: error.message });
        })

        const { verified, authenticationInfo } = verification;
        if (!verified) return res.status(400).send({ error: 'Could not verify authenticator' });
        res.status(200).json({ verified: true });
        const { newCounter } = authenticationInfo;
        await saveUpdatedAuthenticatorCounter(authenticator, newCounter);
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