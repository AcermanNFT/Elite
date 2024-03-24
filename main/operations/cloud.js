const Express = require("express");
const express = Express();
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, ".", "config", ".env"),
});

express.get("/fortnite/api/cloudstorage/system/config", async (req, res) => {
  var csFiles = [];
  for (var file of fs.readdirSync("cloud")) {
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

express.get(
  "/fortnite/api/cloudstorage/system/:file",
  async (req, res, next) => {
    try {
      if (req.params.file.includes("..")) {
        return res.status(404).json({
          errorCode: "404",
          errorname: "errors.Tiva.Nice.Try.Bud",
          errorMessage: "cant access files that arent cloudstorage!",
          numericErrorCode: 404,
          originatingService: "any",
          intent: "prod",
        });
      }
      const data = fs
        .readFileSync("../local/cloud/" + req.params.file)
        .toString();
      res.send(data);
    } catch (error) {
      return res.status(404).json({
        errorCode: "404",
        errorname: "errors.Tiva.Nice.Try.Bud",
        errorMessage: "cant access files that arent cloudstorage!",
        numericErrorCode: 404,
        originatingService: "any",
        intent: "prod",
      });
    };
  }
);

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
