const Express = require('express');
const express = Express();
const mongoose = require('mongoose');
const fs = require("fs");
const functions = require("./utils/functions/functions.js");
const log = require("./utils/base/log.js");
const path = require("path");
const axios = require('axios');
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

function loadProfile(profileId) {
    return JSON.parse(fs.readFileSync(`${process.env.directory}/athena/profile_athena.json`));
}

async function updateAthena() {
    while (true) {
        try {
            const req = await axios.get('https://fortnite-api.com/v2/cosmetics/br/');
            var athena = loadProfile("athena");
            var items = req.data.data;

            items.forEach(cosmetic => {
                var cosmeticVariants = [];

                if (cosmetic.variants) {
                    cosmetic.variants.forEach(variant => {
                        var owned = [];
                        variant.options.forEach(option => { owned.push(option.tag) });
                        cosmeticVariants.push({
                            'channel': variant.channel,
                            'active': owned[0],
                            'owned': owned
                        });
                    });
                }

                athena.items[`${cosmetic.type.backendValue}:${cosmetic.id}`] = {
                    'templateId': `${cosmetic.type.backendValue}:${cosmetic.id}`,
                    'attributes': {
                        'max_level_bonus': 1001,
                        'level': 1,
                        'item_seen': true,
                        'rnd_sel_cnt': 0,
                        'xp': 0,
                        'variants': cosmeticVariants,
                        'favorite': false
                    },
                    'quantity': 1
                };
            });

            fs.writeFileSync(`${process.env.directory}/athena/profile_athena.json`, JSON.stringify(athena, null, 2));
            await new Promise(r => setTimeout(r, 1800000));
        } catch (error) {
            log.debug("Error updating Athena:", error);
            await new Promise(r => setTimeout(r, 60000)); 
        }
    }
}

function start() {
    express.listen(port, () => {
        log.backend(`Backend Started on Port ${port}`);
        updateAthena();
    });
}

module.exports = express