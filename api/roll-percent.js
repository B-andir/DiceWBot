const genPercent = require('../Utility/generate-percentage.js');
const percentToDice = require('../Utility/percent-to-dice.js');

const { logPercent } = require('../bot/bot-client.js');

module.exports = async (req, res) => {

    const percent = await genPercent();
    const dice = await percentToDice(percent);

    logPercent(req.body.data.id, req.body.data.guildId, percent, dice)

    res.send({ total: percent, dice: dice });
}