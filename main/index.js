const Express = require('express');
const express = Express();
const mongoose = require('mongoose');
const fs = require("fs");
const functions = require("./utils/functions/functions.js");
const log = require("./utils/base/log.js");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '.', 'config', '.env')});

const port = process.env.PORT

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB);

mongoose.connection.on('connected', () => {
    log.auth('Connected to MongoDB');
    start();
    functions.collections();
});

express.use((req, res, next) => {
    if (req.originalUrl === '/favicon.ico') {
      next(); 
    } else {
      log.backend(`${req.method} ${req.originalUrl}`);
      next();
    }
});

const load = path.join(__dirname, 'operations');

fs.readdirSync(load).forEach(fileName => {
    const filePath = path.join(load, fileName);
    if (fileName.endsWith('.js')) {
        const route = require(filePath);
        express.use(route);
    }
});

express.get('/', async (req, res) => {
    res.json({
        message: "uhm idk man im bored"
    });
});


express.use(async (req, res, next) => {
    log.backend("Error: " + req.path);
    res.status(404).json({
        error: 'Route does not exist'
    });
});

function start() {
    express.listen(port, () => {
        log.backend(`Backend Started on Port ${port}`);
    });
}

module.exports = express