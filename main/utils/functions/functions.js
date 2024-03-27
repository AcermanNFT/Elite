const fs = require("fs");
const path = require("path");
const log = require("../base/log.js");
const mongoose = require('mongoose');
const crypto = require('crypto');
const cdata = require('../../database/local/collections.json');
const Express = require('express');
const express = Express();
require('dotenv').config({ path: path.resolve(__dirname, '.', 'config', '.env')});

function genSecret() {
    return crypto.randomBytes(16).toString('hex'); 
}

async function collections() {
    const ec = await mongoose.connection.db.listCollections().toArray();
    
    cdata.collections.forEach(async (collectionName) => {
        const ce = ec.some(collection => collection.name === collectionName);
        if (!ce) {
            mongoose.model(collectionName, {});
            log.backend(`Table "${collectionName}" created`);
        }
    });
}

const verifysecret = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const secret = authHeader.split(' ')[1];

    try {
        const user = await User.findOne({ secret: secret }).exec();
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = user; 
        next();
    } catch (err) {
        log.debug(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

function version(req) {
    let ver = {
        season: 0,
        build: 0.0,
        CL: "0",
        lobby: ""
    }

    if (req.headers["user-agent"]) {
        let CL = "";

        try {
            let BuildID = req.headers["user-agent"].split("-")[3].split(",")[0];

            if (!Number.isNaN(Number(BuildID))) CL = BuildID;
            else {
                BuildID = req.headers["user-agent"].split("-")[3].split(" ")[0];

                if (!Number.isNaN(Number(BuildID))) CL = BuildID;
            }
        } catch {
            try {
                let BuildID = req.headers["user-agent"].split("-")[1].split("+")[0];

                if (!Number.isNaN(Number(BuildID))) CL = BuildID;
            } catch {}
        }

        try {
            let Build = req.headers["user-agent"].split("Release-")[1].split("-")[0];

            if (Build.split(".").length == 3) {
                let Value = Build.split(".");
                Build = Value[0] + "." + Value[1] + Value[2];
            }

            ver.season = Number(Build.split(".")[0]);
            ver.build = Number(Build);
            ver.CL = CL;
            ver.lobby = `LobbySeason${ver.season}`;

            if (Number.isNaN(ver.season)) throw new Error();
        } catch {
            if (Number(ver.CL) < 3724489) {
                ver.season = 0;
                ver.build = 0.0;
                ver.CL = CL;
                ver.lobby = "LobbySeason0";
            } else if (Number(ver.CL) <= 3790078) {
                ver.season = 1;
                ver.build = 1.0;
                ver.CL = CL;
                ver.lobby = "LobbySeason1";
            } else {
                ver.season = 2;
                ver.build = 2.0;
                ver.CL = CL;
                ver.lobby = "LobbyWinterDecor";
            }
        }
    }

    return ver;
}

function contentpages(req) {
    const c = require("../../local/operations/c.json")
    return c;
}


module.exports = {
    contentpages,
    version,
    genSecret,
    verifysecret,
    collections
};
