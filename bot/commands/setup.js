const { SlashCommandBuilder, ChannelType, PermissionFlagsBits  } = require('discord.js');

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
            .setName('website')
            .setDescription('Generate website link specific for the server. Required for logging to function.')
            .addChannelOption(option => 
                option
                    .setName('channel')
                    .setDescription('Channel to send website link to. Empty = this channel')
                    .setRequired(false)
                    .addChannelTypes(ChannelType.GuildText))
        )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'logging') {
            
        }
        await interaction.reply({ content: 'Not yet implemented', ephemeral: true});
    }

}