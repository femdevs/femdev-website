const express = require("express");
const router = express.Router();

const routes = require("./router/router");

router.use(routes);

module.exports = router;


