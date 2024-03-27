const Express = require("express");
const express = Express();
const path = require("path");
const crypto = require("crypto");
const log = require("../utils/base/log.js");
const fs = require("fs");
require("dotenv").config({
  path: path.resolve(__dirname, ".", "config", ".env"),
}); 

express.get("/fortnite/api/cloudstorage/system/config", async (req, res) => {
  var csFiles = [];
  for (var file of fs.readdirSync("main/local//cloud/")) {
    var f = fs.readFileSync("main/local/cloud/" + file).toString();
    csFiles.push({
      uniqueF: file,
      F: file,
      hash: crypto.createHash("sha1").update(f).digest("hex"),
      hash256: crypto.createHash("sha256").update(f).digest("hex"),
      length: f.length,
      contentType: "application/octet-stream",
      uploaded: new Date().toISOString(),
      storageType: "S3",
      storageIds: {},
      doNotCache: true,
    });
  }

  res.json(csFiles);
});

express.get('/fortnite/api/cloudstorage/system/:F', (req, res) => {
  const F = req.params.F;
  const FP = path.join(__dirname, 'main/local/cloud', F);

  if (fs.existsSync(FP)) {
    res.sendFile(FP);
  } else {
    res.status(404).end();
  }
}); 

express.get('/fortnite/api/cloudstorage/system', async (req, res) => {
  if (!req.headers['user-agent'] || !req.headers['user-agent'].includes('Mozilla')) {
    log.auth('New login to Elite!');
  }  const output = [];
      const dir = await fs.promises.opendir('../Elite/main/local/cloud/');
      for await (const dirent of dir) {
        const F = dirent.name;
        const FP = path.join(__dirname, '../local/cloud/', F);
        const FD = fs.readFileSync(FP);
  
        output.push({
          "uniqueF": F,
          "F": F,
          "hash": crypto.createHash("sha1").update(FD).digest("hex"),
          "hash256": crypto.createHash("sha256").update(FD).digest("hex"),
          "length": FD.length,
          "contentType": "text/plain",
          "uploaded": fs.statSync(FP).mtime,
          "storageType": "S3",
          "doNotCache": false
        });
      }
  
      res.json(output);
  });

express.use((req, res, next) => {
  if (
    req.originalUrl
      .toLowerCase()
      .startsWith("/fortnite/api/cloudstorage/user/") &&
    req.method === "PUT"
  ) {
    req.rawBody = "";
    req.setEncoding("latin1");
    req.on("data", (chunk) => (req.rawBody += chunk));
    req.on("end", () => next());
  } else return next();
});

module.exports = express;
