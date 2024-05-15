const axios = require('axios');
const { SlashCommandBuilder } = require('discord.js');
const generatePercent = require('../../Utility/generate-percentage.js')
const percentToNumbers = require('../../Utility/percent-to-dice.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('r')
		.setDescription('Roll a percentage check.'),
	async execute(interaction) {
        let percent = 0;
        generatePercent()
            .then((result) => {
                percent = result;
            })
            .finally(async () => {
                if (percent < 1 || percent > 100) {
                    await interaction.reply('**There was an error, please try again**')
                }

                const numbers = await percentToNumbers(percent)

                await interaction.reply(`## Percentage: ${percent}%\n> Rolls: ${numbers[0]} ${numbers[1]}`);
            })

	},
};