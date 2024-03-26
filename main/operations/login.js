const Express = require('express');
const log = require("../utils/base/log.js");
const User = require('../database/models/users.js');
const express = Express();

express.use(Express.json());

let clients = 0;

express.post('/login', async (req, res) => {
    const { secret } = req.body;

    if (!secret) {
        return res.status(400).json({ error: 'Secret is required' });
    }

    try {
        const user = await User.findOne({ secret: secret }).exec();
        if (!user) {
            return res.status(401).json({ error: 'Invalid secret' });
        }

        log.auth("Logged in", user.username);
        clients++; 
        return res.status(200).json({ secret: user.secret, username: user.username });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

express.get('/onlineusers', (req, res) => {
    res.json({ "Users Online": clients });
});

module.exports = express;