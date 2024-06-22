const { getGuilds } = require('../bot/bot-client.js');

module.exports = async (req, res) => {
    const guilds = getGuilds();

    res.send(guilds);
}