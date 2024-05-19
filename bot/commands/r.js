const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { SlashCommandBuilder } = require('discord.js');
const generatePercent = require(path.join(__dirname, '../../utility/generate-percentage.js'));
const percentToNumbers = require(path.join(__dirname, '../../utility/percent-to-dice.js'));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('r')
		.setDescription('Roll a percentage check.'),
	async execute(interaction) {

        await fs.readFile('./bot/function-settings.json', 'utf8', async (error, jsonString) => {
            if (error) {
                console.log(`Error reading file: ${error}`);
                await interaction.reply({ content: 'There was an error, please try again.', ephemeral: true });
                return;
            }

            try {
                jsonData = JSON.parse(jsonString);

                const guildRule = jsonData.logging.find(item => item.guildId === interaction.guildId)
                if (guildRule && guildRule.channelId != interaction.channelId) {
                    await interaction.reply({ content: `Please only roll dice in <#${guildRule.channelId}>`, ephemeral: true })
                } else {
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
            
                            await interaction.reply(`## Percentage: ${percent}%\n> Rolls: **${numbers[0]}** & **${numbers[1]}**`);
                        })
                }

            } catch (error) {
                console.error(`There was an error reading JSON settings data: ${error}`);
                interaction.reply({ content: 'There was an error, please try again later', ephemeral: true })
                return;
            }

        });


	},
};