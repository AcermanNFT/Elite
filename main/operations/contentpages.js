const Express = require('express');
const express = Express();
const functions = require("../utils/functions/functions.js");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '.', 'config', '.env')});

express.get("/content/api/pages/fortnite-game", async (req,res) => {
    const c = functions.contentpages(req);

    res.json(c);
});

express.get("/content/api/pages/fortnite-game/media-events", async (req,res) => {
    res.json({})
});

module.exports = express;