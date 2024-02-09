const router = require('express').Router();
require('dotenv').config();

const projects = require('./project');

router
    .use('/projects', projects)

module.exports = router;