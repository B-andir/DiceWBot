const genRolls = require('../Utility/generate-rolls.js');

const { logRoll } = require('../bot/bot-client.js');

module.exports = async (req, res) => {

    const dice = await genRolls(req.body.data.numDice);

    let total = 0;
    
    if (dice.length > 0) {
        dice.forEach(element => {
            total += element;
        });
    }

    logRoll(req.body.data.id, req.body.data.guildId, total, dice, req.body.data.isSecretRoll)

    res.send({ total: total, dice: dice });
}