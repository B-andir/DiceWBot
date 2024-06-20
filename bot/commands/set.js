const { SlashCommandBuilder } = require('discord.js');
const { SaveUserPrefs } = require('../utility/settings.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set')
		.setDescription('Set personal user-specific settings')
		.addSubcommand(subcommand => 
			subcommand
				.setName('mentions')
				.setDescription('Disable/Enable mentioning me in messages, enabled by default')
				.addStringOption(option => 
					option
						.setName('value')
						.setDescription('On/Off')
						.setRequired(true)
						.addChoices(
							{ name: 'On', value: 'on' },
							{ name: 'Off', value: 'off' }
						)
				)

		),
	async execute(interaction) {

		if (interaction.options.getSubcommand() === 'mentions') {

			// If option is "off", disable pings will be true
			const disablePings = interaction.options.getString('value') === 'off'
			
			SaveUserPrefs(interaction.user.id, 'disabledPings', disablePings)

			if (disablePings) {

				interaction.reply({ content: 'You will no longer get mentioned by the bot.', ephemeral: true })

			} else {

				interaction.reply({ content: 'You will now get mentioned by the bot.', ephemeral: true })

			}

		}

	},
};