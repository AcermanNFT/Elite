const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    secret: String,
    staff: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);
