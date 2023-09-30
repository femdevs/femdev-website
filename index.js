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

class Formatter {
    static perms = {
        readData: 1 << 0,   // 1
        readTokens: 1 << 1,   // 2
        readUsers: 1 << 2,   // 4
        writeData: 1 << 3,   // 8
        writeTokens: 1 << 4,   // 16
        writeUsers: 1 << 5,   // 32
        createData: 1 << 6,   // 64
        createTokens: 1 << 7,   // 128
        createUsers: 1 << 8,   // 256
        deleteData: 1 << 9,   // 512
        deleteTokens: 1 << 10,   // 1024
        deleteUsers: 1 << 11,   // 2048
        developer: 1 << 12,   // 4096
        admin: 1 << 13,   // 8192
        owner: 1 << 14,   // 16384
    }
    static permissionBitToReadable(bit) {
        const permissions = [];
        Object.entries(this.perms).forEach(([key, value]) => {
            if ((value & bit) === value) permissions.push(key);
        })
        return permissions;
    }
    static permissionStringArrayToBit(string) {
        const bitArray = [];
        string.forEach((permission) => {
            const bit = this.perms[permission];
            if (bit) bitArray.push(bit);
        })
        return bitArray.reduce((a, b) => a + b, 0);
    }
    static formatDateTime = new Intl.DateTimeFormat('en-US', { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "long", timeZone: "America/Detroit", timeZoneName: "longGeneric" }).format;
    static formatDate = new Intl.DateTimeFormat('en-US', { year: "numeric", month: "long", day: "numeric", weekday: "long" }).format;
    static formatTime = new Intl.DateTimeFormat('en-US', { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "America/Detroit", timeZoneName: "shortOffset" }).format;
    static dobToAge(dob) {
        const date = new Date(dob);
        const diff = Date.now() - date.getTime();
        const age = new Date(diff);
        return Math.abs(age.getUTCFullYear() - 1970);
    }
}

app
    .set('view engine', 'pug')
    .set('case sensitive routing', false)
    .set('trust proxy', true)
    .set('x-powered-by', false)
    .use((req, _, next) => {
        function checkPerm(userbit, ...neededPerms) {
            const userPerms = Formatter.permissionBitToReadable(userbit);
            if (userPerms.includes('owner') || userPerms.includes('admin')) return true;
            return neededPerms.some(perm => userPerms.includes(perm));
        }
        req.FirebaseAdmin = AdminApp;
        req.auth = auth
        req.Database = require('./functions/database');
        req.Formatter = Formatter;
        req.checkPerms = checkPerm;
        next();
    })
    .use('/', router);

http
    .createServer(app)
    .listen(3001, () => console.log('http server is up'));
