const Express = require('express');
const express = Express();
const functions = require("../utils/functions/functions.js");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '.', 'config', '.env')});

express.get("/socialban/api/public/v1/:any", async (req, res) => {
    res.status(204).end();
});

module.exports = express;
