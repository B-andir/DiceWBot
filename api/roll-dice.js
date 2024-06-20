const genRolls = require('../Utility/generate-rolls.js');

const { logRoll } = require('../bot/bot-client.js');

module.exports = async (req, res) => {

    const dice = await genRolls();

    let total = 0;
    
    dice.forEach(element => {
        total += element;
    });

    logRoll(req.body.data.id, req.body.data.displayName, total, dice)

    res.send({ total: total, dice: dice });
}