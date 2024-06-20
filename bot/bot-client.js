const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { GetSettings, SaveSettings, SaveSetting } = require('./utility/settings.js');
const soundboard = require('./utility/soundboard.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });

client.commands = new Collection();

//create a list of files in command directory that end with .js
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on(Events.InteractionCreate, async interaction => {
	
	if (interaction.isButton()) {

		if (interaction.customId === "rollDiceButton") {
			
			try {
				const rollCommand = interaction.client.commands.get('r');

				await rollCommand.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		}
	}

	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		
		// await command.execute(interaction);
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	}

	
});


const rollButton = new ButtonBuilder()
	.setCustomId('rollDiceButton')
	.setLabel('Roll the Dice')
	.setStyle(ButtonStyle.Primary)

const rollActionRow = new ActionRowBuilder()
	.addComponents(rollButton)	

// Roll Dice button on bottom of Dice Channels
client.on(Events.MessageCreate, async message => {
	let settings = await GetSettings(message.guildId)
	
	const loggingChannelId = settings?.loggingChannelId;
	const secondaryDiceChannelId = settings?.secondDiceChannelId;

	if (loggingChannelId || secondaryDiceChannelId) {

		// Logging Channel
		if (message.channelId == loggingChannelId) {
			if (message.components) {
				if (message.components.includes(rollActionRow)) {
					console.log("Message already has action row.");
					return;
				}
			}
	
			try {
				const channel = await client.channels.cache.get(loggingChannelId);
				
				// If there is a message with a button, remove the button from that message.
				if (settings.buttonMessageId) {
					const oldMessage = await channel.messages.fetch(settings.buttonMessageId);
				
					try {
						// If standalone message, delete message
						if (settings.buttonMessageStandalone) {
							
							oldMessage.delete();
			
						// Edit message to remove the components
						} else {
				
							oldMessage.edit({ components: [] });
						}
					} catch (error) {
						console.log("There was an error removing old button. As a result, it will not be removed. Error: ")
						console.log(error);
					}
				
				}
				
				// If last message was sent by this client
				if (message.author.id == client.user.id) {
					
					message.edit( { components: [rollActionRow] } )
		
					SaveSettings(message.guildId, [{setting: 'buttonMessageId', value: message.id}, {setting: 'buttonMessageStandalone', value: false}])
		
				// Message was sent by a user, so send a new message with the action row
				} else {
		
					channel.send({ components: [rollActionRow] })
						.then(newMessage => {
		
							SaveSettings(newMessage.guildId, [{setting: 'buttonMessageId', value: newMessage.id}, {setting: 'buttonMessageStandalone', value: true}])
		
						}).catch(console.error);
		
				}
			} catch (error) {
				console.log("There was an error when getting old dice button message. As a result, it will not be removed and the old message ID will be deleted from the database")
				SaveSetting(message.guildId, "buttonMessageId", null);
			}


		// Secondary Dice Channel
		} else if (message.channelId == secondaryDiceChannelId) {
			if (message.components) {
				if (message.components.includes(rollActionRow)) {
					console.log("Message already has action row.");
					return;
				}
			}
	
			try {
				const channel = await client.channels.cache.get(secondaryDiceChannelId);
			
				// If there is a message with a button, remove the button from that message.
				if (settings.secondaryButtonMessageId) {
					const oldMessage = await channel.messages.fetch(settings.secondaryButtonMessageId);
				
					try {
						// If standalone message, delete message
						if (settings.secondaryButtonMessageStandalone) {
							
							oldMessage.delete();
			
						// Edit message to remove the components
						} else {
				
							oldMessage.edit({ components: [] });
						}
					} catch (error) {
						console.log("There was an error removing old button. As a result, it will not be removed. Error: ")
						console.log(error);
					}
				
				}
		
				// If last message was sent by this client
				if (message.author.id == client.user.id) {
					
					message.edit( { components: [rollActionRow] } )
		
					SaveSettings(message.guildId, [{setting: 'secondaryButtonMessageId', value: message.id}, {setting: 'secondaryButtonMessageStandalone', value: false}])
		
				// Message was sent by a user, so send a new message with the action row
				} else {
		
					channel.send({ components: [rollActionRow] })
						.then(newMessage => {
		
							SaveSettings(newMessage.guildId, [{setting: 'secondaryButtonMessageId', value: newMessage.id}, {setting: 'secondaryButtonMessageStandalone', value: true}])
		
						}).catch(console.error);
		
				}
			} catch (error) {
				console.log("There was an error when getting old dice button message. As a result, it will not be removed and the old message ID will be deleted from the database")
				SaveSetting(message.guildId, "secondaryButtonMessageId", null);
			}
		}
	}
});

async function clientLogin() {
	await client.login(process.env.BOT_TOKEN).then(async () => {
		soundboard.initialize();
	});

}


// ---- MISCELANEOUS -----

function appendOrUpdateObject(newObj, targetArray, key) {
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

// Soundboard
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
	if (oldState.member.user.bot || newState.member.user.bot) return;


	let newUserChannel = newState.channelId;
	let oldUserChannel = oldState.channelId;


	if (newUserChannel) {

		setTimeout(async () => {
			await soundboard.joinVoice(newState.channelId, newState.guild.id, false);
		}, 500)


	} else if (oldUserChannel) {
		let targetChannel = client.channels.cache.find(c => c.id == oldUserChannel)

		if(targetChannel.members.size <= 1) {
			await soundboard.disconnectVoice(oldState.guild.id);
		}

	}

});


// ----- Exports -----

module.exports = { clientLogin };
exports.client = client