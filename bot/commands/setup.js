const { v4: uuidv4 } = require('uuid')
const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { isNumber } = require('util');
const { SaveSetting } = require('../utility/settings.js')

var jsonData;

function appendOrUpdateObject(newObj, targetArray, key) {

    if (!targetArray || targetArray == null || targetArray == undefined) {
        targetArray = [newObj];
        return targetArray;
    }

    const existingIndex = targetArray?.findIndex(item => item[key] === newObj[key]);
    if (!existingIndex) {
        targetArray = []
    }

    if (existingIndex && existingIndex !== -1) {
        // If object with the same key value exists, update it
        targetArray[existingIndex] = newObj;
    } else {
        // Otherwise, append the new object
        targetArray.push(newObj);
    }

    return targetArray;
}

module.exports = { 
    data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up Dice-o-Tron logging')
    .addSubcommand(subcomand =>
        subcomand
            .setName('logging')
            .setDescription('Set up logging functionality. Also requires website setup')
            .addChannelOption(option => 
                option
                    .setName('channel')
                    .setDescription('Channel to send logs to. Empty = this channel')
                    .setRequired(false)
                    .addChannelTypes(ChannelType.GuildText))
        )   
    .addSubcommand(subcomand =>
        subcomand
            .setName('secondary-rolling')
            .setDescription('Set up a secondary rolling channel, seperate from the logging channel')
            .addChannelOption(option => 
                option
                    .setName('channel')
                    .setDescription('Channel to send logs to. Empty = this channel')
                    .setRequired(false)
                    .addChannelTypes(ChannelType.GuildText))
        )   
    // .addSubcommand(subcomand =>
    //     subcomand
    //         .setName('website')
    //         .setDescription('Generate website link specific for the server. Required for logging to function.')
    //         .addChannelOption(option => 
    //             option
    //                 .setName('channel')
    //                 .setDescription('Channel to send website link to. Empty = this channel')
    //                 .setRequired(false)
    //                 .addChannelTypes(ChannelType.GuildText))
    //     )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        // Logging setup
        if (interaction.options.getSubcommand() === 'logging') {

            let channelInput = interaction.options.getChannel('channel') ?? interaction.channelId;

            if (typeof channelInput !== 'string')
                channelInput = String(channelInput)

            // Clean channel input value
            const channel = channelInput.replace(/\D/g, '');
            
            SaveSetting(interaction.guildId, 'loggingChannelId', channel);

            await interaction.reply({ content: `Channel <#${channel}> set up for logging.`, ephemeral: true });

        }

        // Secondary Rolling setup
        if (interaction.options.getSubcommand() === 'secondary-rolling') {

            let channelInput = interaction.options.getChannel('channel') ?? interaction.channelId;

            if (typeof channelInput !== 'string')
                channelInput = String(channelInput)

            // Clean channel input value
            const channel = channelInput.replace(/\D/g, '');

            SaveSetting(interaction.guildId, 'secondDiceChannelId', channel);

            await interaction.reply({ content: `Channel <#${channel}> set up for dice rolling.`, ephemeral: true });

        }

        // Website setup
        else if (interaction.options.getSubcommand() === 'website') {

            let channelInput = interaction.options.getChannel('channel') ?? interaction.channelId;

            if (typeof channelInput !== 'string')
                channelInput = String(channelInput)

            // Clean channel input value
            const channel = channelInput.replace(/\D/g, '');

            const uuid = uuidv4().split('-')[0];


            // New setting object
            const newObj = { 'guildId': interaction.guildId, 'id': uuid };
            appendOrUpdateObject(newObj, settings.websites, 'guildId')

            settingsCache.SaveSettings(settings);


            // Setup custom link
            const newUrl = process.env.URL + "?id=" + uuid;

            const embed = new EmbedBuilder('')
                .setColor(0x3b8dff)
                .setTitle('Dice Roller')
                .setURL(newUrl)
                .setDescription('Simple discord dice roller for Warhammer TTRPG\n')
                .setThumbnail('https://cdn.discordapp.com/app-icons/1240235303080300575/d639a0d0a48532cc5922af4ccb80f9ef.png?size=256&quot')
                .addFields(
                    { name: 'Bot or Website', value: 'Prefer discord \'/\' commands over a website? Don\'t worry, you can choose!\n' },
                    { name: 'Commands', value: 'Simply type `/r` in the designated dice rolling channel to roll your dice.', inline: true },
                    { name: 'Website', value: 'Click the \'ROLL\' button to roll your dice. Results will be saved in the dice rolling channel to prevent deception attempts', inline: true },
                    { name: 'Website Access', value: 'Use the link below to access the website' }
                )

            const linkButton = new ButtonBuilder()
                .setLabel('Ranald\'s Dice Room')
                .setURL(newUrl)
                .setStyle(ButtonStyle.Link)

            const row = new ActionRowBuilder()
                .addComponents(linkButton)

            await interaction.reply({ content: 'Link successfully created and sent', ephemeral: true })
                .then(async () => {
                    await interaction.client.channels.fetch(channel)
                        .then(channel => channel.send({ embeds: [embed], components: [row] }));
                })

            return;
        }
    }

}