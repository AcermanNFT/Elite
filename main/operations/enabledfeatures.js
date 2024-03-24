const Express = require('express');
const express = Express();
const functions = require("../utils/functions/functions.js");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '.', 'config', '.env')});


express.get("/fortnite/api/game/v2/enabled_features", async (req, res) => {
    res.json({});
});

module.exports = express;