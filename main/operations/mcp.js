const Express = require('express');
const express = Express();
const log = require("../utils/base/log.js");
const functions = require("../utils/functions/functions.js");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '.', 'config', '.env')});

module.exports = express;