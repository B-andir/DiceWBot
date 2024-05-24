const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const settingsCache = require('./utility/settingsCache.js')
const soundboard = require('./utility/soundboard.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });

let settingsExist = false;

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
	
	loggingSetup();
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

// Roll Dice button on bottom of Dice Channel
client.on(Events.MessageCreate, async message => {
	let settings = settingsCache.GetCachedSettings();
	
	const loggingChannel = await settings.logging?.find((element) => { return element.channelId == message.channel });

	if (loggingChannel) {
		// console.log(message)

		if (message.components) {
			if (message.components.includes(rollActionRow)) {
				console.log("Message already has action row.");
				return;
			}
		}

		const channel = await client.channels.cache.get(loggingChannel.channelId);
		
		// If there is a message with a button, remove the button from that message.
		if (loggingChannel.buttonMessageId) {
			const oldMessage = await channel.messages.fetch(loggingChannel.buttonMessageId);
		
			try {
				// If standalone message, delete message
				if (loggingChannel.standaloneMessage) {
					
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

			// Update the logging object
			for (let log of settings.logging) {
				if (log.guildId === message.guildId || log.channelId === message.channelId) {
					log.buttonMessageId = message.id;
					log.standaloneMessage = false;
					settingsCache.SaveSettings(settings);
					break;
				}
			}


		// Message was sent by a user, so send a new message with the action row
		} else {

			channel.send({ components: [rollActionRow] })
				.then(newMessage => {

					// Update the logging object
					for (let log of settings.logging) {
						if (log.guildId === newMessage.guildId || log.channelId === newMessage.channelId) {
							log.buttonMessageId = newMessage.id;
							log.standaloneMessage = true;
							settingsCache.SaveSettings(settings);
							break;
						}
					}
				}).catch(console.error);

		}
		

	}
	
});

async function clientLogin() {
	await client.login(process.env.BOT_TOKEN).then(async () => {
		await settingsCache.UpdateCache().then(() => {
			settingsExist = true;
			soundboard.initialize();
		});
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


// Log Rolls
async function logRoll(id, displayName, percentage, dice) {

	const settings = settingsCache.GetCachedSettings();

	const targetGuild = settings.websites?.find((element) => { return element.id == id });

	if (targetGuild) {
		const targetChannel = await settings.logging?.find((element) => { return element.guildId == targetGuild.guildId });

		if (targetChannel) {

			const channel = client.channels.cache.get(targetChannel.channelId);

			await channel.send(`## Percentage: ${percentage}%\n> Rolls: **${dice[0]}** & **${dice[1]}**\t\t*~ ${displayName}*`);

		} else {
			console.error('There was an error logging dice roll. Could not find target channel of guildId: ' + targetGuild.guildId);
			return;
		}
	} else {
		console.error('There was an error logging dice roll. Could not find target guild of id: ' + id);
		return;
	}

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


// Setup logging from environment vars
async function loggingSetup() {
	if (process.env.LOGGING_CHANNEL && process.env.LOGGING_CHANNEL_GUILD) {
		console.log("Setting up logging from environment variables ...")

		let settings = await settingsCache.GetCachedSettings();
	
		// New setting object
		const newObj = { 'guildId': process.env.LOGGING_CHANNEL_GUILD, 'channelId': process.env.LOGGING_CHANNEL };
		try {
			settings.logging = appendOrUpdateObject(newObj, settings.logging, 'guildId')
		} catch (error) {
			console.error('There was an error building logging from environment vars: ' + error);
			return;
		}

		// Write updated jsonData to the settings file
		settingsCache.SaveSettings(settings);

		console.log("Logging successfully set up!")
	}
}


// ----- Exports -----

module.exports = { clientLogin, logRoll };
exports.client = client