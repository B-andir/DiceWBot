const mongoose = require('mongoose');

const activeVoiceConnectionSchema = new mongoose.Schema({
    guildId: String,
    channelId: String,
});

const ActiveVoiceConnectionModel = mongoose.model('ActiveVoiceConnections', activeVoiceConnectionSchema);

module.exports = ActiveVoiceConnectionModel;