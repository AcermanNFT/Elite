const mongoose = require('mongoose');

const launcherversionsSchema = new mongoose.Schema({
    version: { type: String, required: true },
    download: { type: String, required: true }
});

module.exports = mongoose.model('launcherversions', launcherversionsSchema);
