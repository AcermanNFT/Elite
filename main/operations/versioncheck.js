const Express = require('express');
const express = Express();
const functions = require("../utils/functions/functions.js");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '.', 'config', '.env')});


express.get("/fortnite/api/v2/versioncheck/*", async (req, res) => {
    res.json({
        "type": "NO_UPDATE"
    });
});

module.exports = express