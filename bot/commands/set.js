const { SlashCommandBuilder } = require('discord.js');
const settingsCache = require('../utility/settingsCache.js')

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
		const settings = settingsCache.GetCachedSettings();

		if (interaction.options.getSubcommand() === 'mentions') {

			// If option is "off", disable pings will be true
			const disablePings = interaction.options.getString('value') === 'off'


			const existingIndex = settings.users.findIndex(item => item['id'] === interaction.user.id);

			if (existingIndex !== -1) {
				settings.users[existingIndex] = { id: interaction.user.id, disablePings: disablePings };
			} else {
				settings.users.push({ id: interaction.user.id, disablePings: disablePings})
			}

			if (disablePings) {

				interaction.reply({ content: 'You will no longer get mentioned by the bot.', ephemeral: true })

			} else {

				interaction.reply({ content: 'You will now get mentioned by the bot.', ephemeral: true })

			}

		}

	},
};