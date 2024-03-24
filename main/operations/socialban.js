const Express = require('express');
const express = Express();
const functions = require("../utils/functions/functions.js");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '.', 'config', '.env')});

express.get("/socialban/api/public/v1/:accountId", async (req,res) => {
    res.json([]);
});

module.exports = express;
