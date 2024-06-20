const path = require('node:path');

const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, createAudioResource, VoiceConnection } = require('@discordjs/voice');
const ActiveVoiceConnections = require('../../models/active-voice-connections.js');
const bot = require('../bot-client.js');

let player;

function appendOrUpdateObject(newObj, targetArray, key) {

    if (!targetArray) {
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


async function joinVoice(channelId, guildId, forced = false) {
    if (getVoiceConnection(guildId) && forced != true) return;

    const guild = await bot.client.guilds.fetch(guildId);
    const voiceAdapterCreator = guild.voiceAdapterCreator;
    
    const connection = joinVoiceChannel({
        channelId: channelId,
        guildId: guildId,
        adapterCreator: voiceAdapterCreator
    });

    connection.subscribe(player);

    let activeVoiceConnection = await ActiveVoiceConnections.findOneAndUpdate({ guildId: guildId}, {channelId: channelId});

    if (!activeVoiceConnection) {
        activeVoiceConnection = new ActiveVoiceConnections({ guildId: guildId, channelId: channelId});
        activeVoiceConnection.save();
    }
}


async function disconnectVoice(guildId) {

    const connection = getVoiceConnection(guildId)

    if (connection) {
        connection.destroy();

        await ActiveVoiceConnections.findOneAndDelete({guildId: guildId});
    }

    return;

}

function playRollSound(percentage, guildId, isSecretChannel) {

    const connection = getVoiceConnection(guildId)
    
    if (!connection) {
        return;
    }

    let diceSound = (Math.floor((Math.random() * 6) + 1));
    diceSound > 6 ? diceSound = 6 : diceSound;
    let diceAudio = createAudioResource(path.join(__dirname, `../../audio/dice${diceSound}.mp3`), { inlineVolume: true });
    diceAudio.volume.setVolumeDecibels(5)

    player.play(diceAudio);
    

    if (!isSecretChannel && (percentage >= 90 || percentage == 69)) {
        setTimeout(() => {
            let audio;
            if (percentage == 69) {
                audio = createAudioResource(path.join(__dirname, '../../audio/nice.mp3'), { inlineVolume: true });
            }
        
            else if (percentage == 100) {
                audio = createAudioResource(path.join(__dirname, '../../audio/getfucked.mp3'), { inlineVolume: true })
            }
        
            else if (percentage >= 90) {
                audio = createAudioResource(path.join(__dirname, '../../audio/ranald.mp3'), { inlineVolume: true });
            }

            audio.volume.setVolumeDecibels(7);

            player.play(audio);

        }, 1800);
    }

}

module.exports = { playRollSound, joinVoice, disconnectVoice, initialize: async () => {
    console.log("Initializing audio player...");
    player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        }
    });

    player.on('playing', () => {
        
    });

    try {
        const activeVoiceConnections = await ActiveVoiceConnections.find({});

        activeVoiceConnections.forEach(connection => {
            try {
                console.log("Found active connection! Joining...");
                setTimeout(() => {
                    joinVoice(connection.channelId, connection.guildId, true);
                    console.log("Joined active voice connection.")
                }, 1000)
            } catch {
                console.log(`Failed joining channel ${connection.channelId} in guild ${connection.guildId}, deleting from database.`);
                ActiveVoiceConnections.findByIdAndDelete(connection['_id'])
            }
        });
    } catch (err) {
        console.error(err);
    }
    

    console.log("Audio Player Initilalized");
}}
