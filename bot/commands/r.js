const { SlashCommandBuilder } = require('discord.js');
const generatePercent = require('../../Utility/generate-percentage.js')
const percentToNumbers = require('../../Utility/percent-to-dice.js')
const { GetSettings, GetUserPrefs } = require('../utility/settings.js')
const { playRollSound } = require('../utility/soundboard.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('r')
		.setDescription('Roll the dice. Percentage check by default')
        .addNumberOption(option => 
            option
                .setName('dice-count')
                .setDescription('Number of dice to roll.')
                .setMaxValue(10)
                .setMinValue(1)
        ),
	async execute(interaction) {

        if (interaction.isChatInputCommand()) {
            if (interaction.options.getNumber('dice-count')) {
                require('./d.js').execute(interaction);
                return;
            }
        }

        const settings = await GetSettings(interaction.guildId);

        try {

            const loggingChannelId = settings?.loggingChannelId;
            const secondaryChannelId = settings?.secondDiceChannelId;

            if ((settings && !loggingChannelId) || !settings || (settings && loggingChannelId == interaction.channelId) || secondaryChannelId == interaction.channelId) {
                // Restrict dice rolls to dice-log and secondary channels
                
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

                        playRollSound(percent, interaction.guildId, secondaryChannelId == interaction.channelId);
        
                        const numbers = await percentToNumbers(percent)

                        if (interaction.isChatInputCommand()) {
                            interaction.deleteReply();
                        }

                        const userSettings = await GetUserPrefs(interaction.user.id)
                        if (userSettings && userSettings.disabledPings === false) {

                            await interaction.channel.send(`## Percentage: ${percent}%\n> Rolls: **${numbers[0]}**  |  **${numbers[1]}**\n\t\t\t\t\t\t\t\t\t*~ <@${interaction.user.id}>*\n-----`);
                            
                        } else {
                            let name = interaction.user.displayName;
                            if (interaction.member.nickname)
                                name = interaction.member.nickname;

                            await interaction.channel.send(`## Percentage: ${percent}%\n> Rolls: **${numbers[0]}**  |  **${numbers[1]}**\n\t\t\t\t\t\t\t\t\t*~ ${name}*\n-----`);
                        }


                    })
            } else {
                    await interaction.reply({ content: `Please only roll dice in <#${loggingChannelId}>`, ephemeral: true })
            }

        } catch (error) {
            console.error(`There was an error reading JSON settings data: ${error}`);
            interaction.reply({ content: 'There was an error, please try again later', ephemeral: true })
            return;
        }


	},
};