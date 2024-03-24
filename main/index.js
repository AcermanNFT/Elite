const Express = require('express');
const express = Express();
const fs = require("fs");
const functions = require("./utils/functions/functions.js");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '.', 'config', '.env')});

const port = process.env.PORT

const load = path.join(__dirname, 'operations');

fs.readdirSync(load).forEach(fileName => {
    const filePath = path.join(load, fileName);
    if (fileName.endsWith('.js')) {
        const route = require(filePath);
        express.use(route);
    }
});

express.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});


express.get('/', async (req,res) => {
    res.json({
        message: "uhm idk man im bored"
    });
});

express.listen(port, () => {
    console.log(`started on port ${port}`);
});

module.exports = express