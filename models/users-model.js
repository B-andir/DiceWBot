const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
    userId: String,
    disabledPings: Boolean
})

const UsersModel = mongoose.model('Users', userSettingsSchema);

module.exports = UsersModel;