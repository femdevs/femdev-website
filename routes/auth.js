const router = require('express').Router();
const bodyParser = require('body-parser');
const SimpleWebAuthnServer = require('@simplewebauthn/server');
const { isoUint8Array } = require('@simplewebauthn/server/helpers');

const {
    getUser: getUserFromDB,
    saveAuthForUser: saveNewUserAuthenticatorInDB,
    updateAuthCounter: saveUpdatedAuthenticatorCounter,
    getUserAuthenticators,
    getUserAuthenticator,
} = require('../functions/passkey');
const { aprilFools } = require('../functions/utilities');


    
const rpName = 'FemDevs OAuth2'
const rpID = (process.env.NODE_ENV?.toLowerCase() === "production") ? 'thefemdevs.com' : 'localhost';
const origin = (process.env.NODE_ENV?.toLowerCase() === "production") ? 'https://thefemdevs.com' : 'http://localhost:3001';

router
    .use(bodyParser.json())
    .get('/register', (req, res) => {
        res.render(
            `auth/register.pug`,
            {
                title: 'Register',
                meta: {
                    title: 'Register',
                    desc: 'Register',
                    url: 'https://thefemdevs.com/auth/register',
                }
            }
        );
    })
    .get('/register/get-creds', async (req, res) => {
        const user = await getUserFromDB('CgomRVx547O56mqNCQmmo0VqgW72');
        const userAuthenticators = await getUserAuthenticators(user, rpID);
        const disallowedCredentials = [];
        for (const authenticator of userAuthenticators) {
            disallowedCredentials.push({
                id: isoUint8Array.fromUTF8String(authenticator.credentialID),
                type: 'public-key',
                transports: authenticator.transports,
            })
        }

        const options = await SimpleWebAuthnServer.generateRegistrationOptions({
            rpName,
            rpID,
            userID: user.firebaseUID,
            userName: `${user.firstname} ${user.lastname}`,
            userDisplayName: user.displayname,
            authenticatorSelection: {
                requireResidentKey: false,
                userVerification: 'preferred',   
            },
            attestationType: 'none',
            excludeCredentials: disallowedCredentials,
            supportedAlgorithmIDs: [-7, -257],
            timeout: 60000,
            attestationType: 'none',
        });

        req.session.challenge = options.challenge;
        req.session.user = user;

        return res.json(options)
    })
    .post('/register/verify', async (req, res) => {
        const { body } = req;
        const user = await getUserFromDB('CgomRVx547O56mqNCQmmo0VqgW72');

        let verification = (await SimpleWebAuthnServer.verifyRegistrationResponse({
            response: body,
            expectedChallenge : req.session.challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            supportedAlgorithmIDs: [-7, -257],
        }).catch((error) => {
            console.error(error);
            res.status(400).send({ error: error.message })
            process.exit(1);
        }))

        res.status(200).json({ verified: verification.verified });
        if (verification.registrationInfo == undefined) throw new Error('Could not get registration info');

        const newAuthenticator = {
            credentialID: body.id,
            credentialPublicKey: isoUint8Array.toUTF8String(verification.registrationInfo.credentialPublicKey),
            counter: verification.registrationInfo.counter,
            transports: body.response.transports,
            rpid: rpID,
        };

        await saveNewUserAuthenticatorInDB(user, newAuthenticator);
    })
    .get('/login', (req, res) => {
        res.render(
            `auth/login.pug`,
            {
                title: 'Login',
                meta: {
                    title: 'Login',
                    desc: 'Login',
                    url: 'https://thefemdevs.com/auth/login',
                }
            }
        );
    })
    .get('/login/get-creds', async (req, res) => {
        const user = await getUserFromDB('CgomRVx547O56mqNCQmmo0VqgW72');
        const userAuthenticators = await getUserAuthenticators(user, rpID);
        const allowCredentials = []
        for (const authenticator of userAuthenticators) {
            allowCredentials.push({
                id: isoUint8Array.fromUTF8String(authenticator.credentialID),
                type: 'public-key',
                transports: authenticator.transports,
            })
        }

        const options = await SimpleWebAuthnServer.generateAuthenticationOptions({
            allowCredentials,
            userVerification: 'preferred',
            rpID,
            timeout: 60000,
        });

        req.session.challenge = options.challenge;
        return res.json(options)
    })
    .post('/login/verify', async (req, res) => {
        const { body } = req;
        const user = await getUserFromDB('CgomRVx547O56mqNCQmmo0VqgW72');
        const authenticator = await getUserAuthenticator(user, body.id);

        if (!authenticator) throw new Error(`Could not find authenticator ${body.id} for user ${user.id}`);

        let verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
            response: body,
            expectedChallenge: req.session.challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                counter: authenticator.counter,
                credentialID: authenticator.credentialID,
                credentialPublicKey: authenticator.credentialPublicKey,
                transports: authenticator.transports,
            },
            advancedFIDOConfig: {
                userVerification: 'preferred'
            }
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
        res.status(405).render(
            `${aprilFools() ? 'aprilfools/' : ''}misc/405.pug`,
            {
                title: '405 - Method Not Allowed',
                path,
                allowedMethods: Object.keys(allowedMethods).map(m => m.toUpperCase()).join(', '),
                methodUsed: methodUsed,
                meta: {
                    title: '405 - Method Not Allowed',
                    desc: '405 - Method Not Allowed',
                    url: 'https://thefemdevs.com/errors/405',
                }
            }
        );
    })

module.exports = router;