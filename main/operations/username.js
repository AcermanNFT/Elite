const Express = require('express');
const express = Express();
const functions = require("../utils/functions/functions.js")
const log = require("../utils/base/log.js")
const User = require('../database/models/users.js');

express.get('/username/:secret', async (req, res) => {
    const { secret } = req.params;
    
    if (secret) {
        try {
            const user = await User.findOne({ secret: secret }).exec();

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json({ username: user.username });
        } catch (err) {
            log.debug(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(400).json({ error: 'Secret is required' });
    }
});

express.get('/user', functions.verifysecret, (req, res) => {
    res.json({ username: req.user.username }); 
});

module.exports = express
