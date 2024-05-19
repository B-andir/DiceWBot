const fs = require('fs');
const axios = require('axios');
const { SlashCommandBuilder } = require('discord.js');
const generatePercent = require('../../Utility/generate-percentage.js')
const percentToNumbers = require('../../Utility/percent-to-dice.js')
const { GetCachedSettings } = require('../utility/settingsCache.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('r')
		.setDescription('Roll a percentage check.'),
	async execute(interaction) {

        const settings = GetCachedSettings();

        try {

            const guildRule = settings.logging.find(item => item.guildId === interaction.guildId)

            if (guildRule && guildRule.channelId != interaction.channelId) {
                // Restrict dice rolls to dice-log channel
                await interaction.reply({ content: `Please only roll dice in <#${guildRule.channelId}>`, ephemeral: true })
                
            } else {
                if (interaction.isChatInputCommand())
                    await interaction.reply({ content: `Rolling Dice...`, ephemeral: true });


                let percent = 0;
                generatePercent()
                    .then((result) => {
                        percent = result;
                    })
                    .finally(async () => {
                        if (percent < 1 || percent > 100) {
                            if (interaction.replied || interaction.deferred) {
                                await interaction.followUp('**There was an error, please try again**')
                            } else {
                                await interaction.reply('**There was an error, please try again**')
                            }
                        }
        
                        const numbers = await percentToNumbers(percent)

                        if (interaction.isChatInputCommand()) {
                            interaction.deleteReply();
                        }

                        const userSettings = await settings.users.find((element) => { return element.id == interaction.user.id });

                        if (userSettings && userSettings.disablePings === true) {
                            await interaction.channel.send(`## Percentage: ${percent}%\n> Rolls: **${numbers[0]}** & **${numbers[1]}**\t\t*~ ${interaction.user.displayName}*\n-----`);
                        } else {
                            await interaction.channel.send(`## Percentage: ${percent}%\n> Rolls: **${numbers[0]}** & **${numbers[1]}**\t\t*~ <@${interaction.user.id}>*\n-----`);
                        }


                    })
            }

        } catch (error) {
            console.error(`There was an error reading JSON settings data: ${error}`);
            interaction.reply({ content: 'There was an error, please try again later', ephemeral: true })
            return;
        }


	},
};