const fs = require('fs');
const axios = require('axios');
const { SlashCommandBuilder } = require('discord.js');
const generateRolls = require('../../Utility/generate-rolls.js')
const percentToNumbers = require('../../Utility/percent-to-dice.js')
const { GetCachedSettings } = require('../utility/settingsCache.js')
const { playRollSound } = require('../utility/soundboard.js');
const { response } = require('express');

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

        const settings = GetCachedSettings();

        try {

            const guildRule = settings.logging?.find(item => item.guildId === interaction.guildId);

            if (guildRule && guildRule.channelId != interaction.channelId) {
                // Restrict dice rolls to dice-log channel
                await interaction.reply({ content: `Please only roll dice in <#${guildRule.channelId}>`, ephemeral: true })
                
            } else {
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

                playRollSound(10, interaction.guildId, interaction.user.id);

                if (interaction.isChatInputCommand()) {
                    interaction.deleteReply();
                }

                const userSettings = await settings.users?.find((element) => { return element.id == interaction.user.id }) ?? undefined;

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

                if (userSettings && userSettings.disablePings === true) {
                    let name = interaction.user.displayName;
                    if (interaction.member.nickname)
                        name = interaction.member.nickname;

                    responseString += `\n\t\t\t\t\t\t\t\t\t*~ ${name}*\n-----`
                    
                } else {
                    responseString += `\n\t\t\t\t\t\t\t\t\t*~ <@${interaction.user.id}>*\n-----`
                }

                await interaction.channel.send(responseString);
            }

        } catch (error) {
            console.error(`There was an error reading JSON settings data: ${error}`);
            interaction.reply({ content: 'There was an error, please try again later', ephemeral: true })
            return;
        }


	},
};