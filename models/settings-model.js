const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    loggingChannelId: String,
    secondDiceChannelId: String,
    buttonMessageId: String,
    buttonMessageStandalone: Boolean,
    secondaryButtonMessageId: String,
    secondaryButtonMessageStandalone: Boolean,
})

const SettingsModel = mongoose.model('Settings', settingsSchema);

module.exports = SettingsModel;