const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js')

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

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
	if (!interaction.isChatInputCommand()) return;

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
});

function clientLogin() {
	client.login(process.env.BOT_TOKEN)
}


// Log Rolls
function logRoll(id, displayName, percentage, dice) {
	
	fs.readFile('./bot/function-settings.json', 'utf8', async (error, jsonString) => {
		if (error) {
			console.error(`Error reading file: ${error}`);
			return;
		}
		
		try {
			const jsonData = JSON.parse(jsonString);

			const targetGuild = jsonData.websites.find((element) => { return element.id == id });

			if (targetGuild) {
				const targetChannel = await jsonData.logging.find((element) => { return element.guildId == targetGuild.guildId });

				if (targetChannel) {

					const channel = client.channels.cache.get(targetChannel.channelId);

					await channel.send(`## Percentage: ${percentage}%\n> Rolls: **${dice[0]}** & **${dice[1]}**\n\t\t\t\t\t\t\t\t*~ ${displayName}*`);

				} else {
					console.error('There was an error logging dice roll. Could not find target channel of guildId: ' + targetGuild.guildId);
					return;
				}
			} else {
				console.error('There was an error logging dice roll. Could not find target guild of id: ' + id);
				return;
			}


		} catch (error) {
			console.error(`Error parsing JSON string: ${error}`);
			return
		}
	});

}



module.exports = { clientLogin, logRoll };