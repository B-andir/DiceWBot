const genPercent = require('../Utility/generate-percentage.js');
const percentToDice = require('../Utility/percent-to-dice.js');

const { logPercent } = require('../bot/bot-client.js');

module.exports = async (req, res) => {

    console.log(req.body.data);

    const percent = await genPercent();
    const dice = await percentToDice(percent);

    logPercent(req.body.data.id, req.body.data.guildId, percent, dice, req.body.data.isSecretRoll)

    res.send({ total: percent, dice: dice });
}