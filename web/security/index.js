const router = require('express').Router();

const routes = require('./routes/router');

router
    .use(routes);

module.exports = router;