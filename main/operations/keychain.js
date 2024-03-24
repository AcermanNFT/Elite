const Express = require('express');
const express = Express();
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '.', 'config', '.env')});

express.get("/fortnite/api/storefront/v2/keychain", async (req, res) => {
    const kc = require("../local/base/kc.json");

    res.json(kc);
});

module.exports = express