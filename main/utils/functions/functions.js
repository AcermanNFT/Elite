const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const Express = require('express');
const express = Express();
require('dotenv').config({ path: path.resolve(__dirname, '.', 'config', '.env')});

function generateRandomSecret() {
    return crypto.randomBytes(16).toString('hex'); 
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
    const ver = version;
    const c = require("../../local/operations/c.json")

    
    try {
        c.dynamicbackgrounds.backgrounds.backgrounds[0].stage = `season${ver.season}`;
        c.dynamicbackgrounds.backgrounds.backgrounds[1].stage = `season${ver.season}`;

        if (ver.season == 10) {
            c.dynamicbackgrounds.backgrounds.backgrounds[0].stage = "seasonx";
            c.dynamicbackgrounds.backgrounds.backgrounds[1].stage = "seasonx";
        }

        if (ver.build == 11.31 || ver.build == 11.40) {
            c.dynamicbackgrounds.backgrounds.backgrounds[0].stage = "Winter19";
            c.dynamicbackgrounds.backgrounds.backgrounds[1].stage = "Winter19";
        }

        if (ver.build == 19.01) {
            c.dynamicbackgrounds.backgrounds.backgrounds[0].stage = "winter2021";
            c.dynamicbackgrounds.backgrounds.backgrounds[0].backgroundimage = "https://cdn.discordapp.com/attachments/927739901540188200/930880158167085116/t-bp19-lobby-xmas-2048x1024-f85d2684b4af.png";
            c.subgameinfo.battleroyale.image = "https://cdn.discordapp.com/attachments/927739901540188200/930880421514846268/19br-wf-subgame-select-512x1024-16d8bb0f218f.jpg";
            c.specialoffervideo.bSpecialOfferEnabled = "true";
        }

        if (ver.season == 20) {
            if (ver.build == 20.40) {
                c.dynamicbackgrounds.backgrounds.backgrounds[0].backgroundimage = "https://cdn2.unrealengine.com/t-bp20-40-armadillo-glowup-lobby-2048x2048-2048x2048-3b83b887cc7f.jpg"
            } else {
                c.dynamicbackgrounds.backgrounds.backgrounds[0].backgroundimage = "https://cdn2.unrealengine.com/t-bp20-lobby-2048x1024-d89eb522746c.png";
            }
        }

        if (ver.season == 21) {
            c.dynamicbackgrounds.backgrounds.backgrounds[0].backgroundimage = "https://cdn2.unrealengine.com/s21-lobby-background-2048x1024-2e7112b25dc3.jpg"
        }
        if (ver.season == process.env.SEASON) {
            c.dynamicbackgrounds.backgrounds.backgrounds[0].backgroundimage = "https://cdn2.unrealengine.com/br-lobby-ch5s2-4096x2304-a0879ccdaafc.jpg"
        }
    } catch {}

    return c;
}


module.exports = {
    contentpages,
    version,
    generateRandomSecret,
    verifysecret
};
