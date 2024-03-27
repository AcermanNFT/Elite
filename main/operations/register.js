const Express = require('express');
const express = Express();
const fs = require("fs");
const functions = require("../utils/functions/functions.js")
const log = require("../utils/base/log.js")
const User = require('../database/models/users.js');

express.use(Express.json());

express.post('/register', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        res.status(400).json({ error: 'Username is required' });
        return;
    }

    try {
        const existingUser = await User.findOne({ username }).exec();
        if (existingUser) {
            res.status(400).json({ error: 'Username already exists' });
            return;
        }

        const secret = functions.genSecret();

        const newUser = new User({ username, secret });
        await newUser.save();
    //    log.backend(req);
        log.auth("New User", username)
        res.status(201).json({ message: 'User registered successfully', username, secret });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = express
