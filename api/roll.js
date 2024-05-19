const genPercent = require('../utility/generate-percentage.js');
const percentToDice = require('../utility/percent-to-dice.js');

const { logRoll } = require('../bot/bot-client.js');

module.exports = async (req, res) => {

    const percent = await genPercent();
    const dice = await percentToDice(percent);

    logRoll(req.body.data.id, req.body.data.displayName, percent, dice)

    res.send({ percent: percent, dice: dice });
}