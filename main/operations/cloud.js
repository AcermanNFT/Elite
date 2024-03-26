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
  for (var file of fs.readdirSync("../local/cloud/")) {
    var f = fs.readFileSync("../local/cloud/" + file).toString();
    csFiles.push({
      uniqueFilename: file,
      filename: file,
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

express.get('/fortnite/api/cloudstorage/system/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, '../local/cloud', fileName);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).end();
  }
});

express.get('/fortnite/api/cloudstorage/system', async (req, res) => {
  log.auth('New login to Elite!')
  const output = [];
      const dir = await fs.promises.opendir('../local/cloud');
      for await (const dirent of dir) {
        const fileName = dirent.name;
        const filePath = path.join(__dirname, '../local/cloud', fileName);
        const fileData = fs.readFileSync(filePath);
  
        output.push({
          "uniqueFilename": fileName,
          "filename": fileName,
          "hash": crypto.createHash("sha1").update(fileData).digest("hex"),
          "hash256": crypto.createHash("sha256").update(fileData).digest("hex"),
          "length": fileData.length,
          "contentType": "text/plain",
          "uploaded": fs.statSync(filePath).mtime,
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
