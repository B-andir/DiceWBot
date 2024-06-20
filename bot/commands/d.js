const { SlashCommandBuilder } = require('discord.js');
const generateRolls = require('../../Utility/generate-rolls.js')
const { GetSettings, SaveSetting, GetUserPrefs } = require('../utility/settings.js')
const { playRollSound } = require('../utility/soundboard.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('d')
		.setDescription('Roll for Damage')
        .addNumberOption(option => 
            option
                .setName('dice-count')
                .setDescription('Number of dice to roll.')
                .setMaxValue(10)
                .setMinValue(1)
        ),
	async execute(interaction) {

        const settings = await GetSettings(interaction.guildId);

        try {

            const loggingChannelId = settings?.loggingChannelId;
            const secondaryChannelId = settings?.secondDiceChannelId;

            if ((settings && !loggingChannelId) || !settings || (settings && loggingChannelId == interaction.channelId) || secondaryChannelId == interaction.channelId) {
                // Restrict dice rolls to dice-log and secondary channels
                
                const numberOfDice = interaction.options.getNumber('dice-count') ?? 1;

                if (interaction.isChatInputCommand())
                    await interaction.reply({ content: `Rolling Dice...`, ephemeral: true });
                
                const numbers = await generateRolls(numberOfDice);
                    
                if (numbers.length != numberOfDice) {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp('**There was an error, please try again**')
                    } else {
                        await interaction.reply('**There was an error, please try again**')
                    }
                }

                playRollSound(10, interaction.guildId, secondaryChannelId == interaction.channelId);

                if (interaction.isChatInputCommand()) {
                    interaction.deleteReply();
                }

                const userSettings = await GetUserPrefs(interaction.user.id);

                let total = 0;
                
                numbers.forEach(element => {
                    total += element;
                });

                let responseString = `## Dice Result: ${total}\n`;

                if (numberOfDice > 1) {
                    responseString += '> Rolls: '
                    for (let index = 0; index < numbers.length; index++) {
                        const element = numbers[index];
    
                        responseString += `**${element}**`
                        
                        if (index < numbers.length - 1) {
                            responseString += '  |  '
                        }
                    }
                }

                if (userSettings && userSettings.disabledPings === true) {
                    let name = interaction.user.displayName;
                    if (interaction.member.nickname)
                        name = interaction.member.nickname;

                    responseString += `\n\t\t\t\t\t\t\t\t\t*~ ${name}*\n-----`
                    
                } else {
                    responseString += `\n\t\t\t\t\t\t\t\t\t*~ <@${interaction.user.id}>*\n-----`
                }

                await interaction.channel.send(responseString);
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