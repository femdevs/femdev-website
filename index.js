const app = require('express')()
const http = require('http');
const Admin = require('firebase-admin');
require('dotenv').config();

const router = require('./routes/router');

const FirebaseServiceAccount = JSON.parse(process.env.FIREBASE_SA);

const AdminApp = Admin.initializeApp({
    credential: Admin.credential.cert(FirebaseServiceAccount),
    databaseURL: `https://${FirebaseServiceAccount.projectId}-default-rtdb.firebaseio.com`
})

const auth = AdminApp.auth();

app
    .set('view engine', 'pug')
    .use((req, res, next) => {
        req.FirebaseAdmin = AdminApp;
        req.auth = auth
        res.FirebaseAdmin = AdminApp;
        res.auth = auth;
        req.Database = require('./functions/database');
        res.Database = require('./functions/database');
        next();
    })
    .use('/', router);

http
    .createServer(app)
    .listen(3001, () => console.log('http server is up'));