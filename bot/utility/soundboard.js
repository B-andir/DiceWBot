const path = require('node:path');
const fs = require('fs');

const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, createAudioResource } = require('@discordjs/voice');
const settingsCache = require('./settingsCache.js');
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

    let settings = settingsCache.GetCachedSettings();
    settings.connections = appendOrUpdateObject({ guildId: guildId, channelId: channelId}, settings.connections, 'guildId') ;

    settingsCache.SaveSettings(settings);
}


async function disconnectVoice(guildId) {

    const connection = getVoiceConnection(guildId)

    if (connection) {
        connection.destroy();

        let settings = settingsCache.GetCachedSettings();
        settings.connections = appendOrUpdateObject({ guildId: guildId, channelId: 'none'}, settings.connections, 'guildId') ;
    
        settingsCache.SaveSettings(settings);
    }

    return;

}

function playRollSound(percentage, guildId, userId) {

    const connection = getVoiceConnection(guildId)
    
    if (!connection) {
        return;
    }

    let diceSound = (Math.floor((Math.random() * 6) + 1));
    diceSound > 6 ? diceSound = 6 : diceSound;
    let diceAudio = createAudioResource(path.join(__dirname, `../../audio/dice${diceSound}.mp3`), { inlineVolume: true });
    diceAudio.volume.setVolumeDecibels(5)

    player.play(diceAudio);


    if (userId == "274583698089967617" && (percentage >= 80 || percentage == 69)) {
        setTimeout(() => {
            let audio;
            if (percentage == 69) {
                audio = createAudioResource(path.join(__dirname, '../../audio/nice.mp3'), { inlineVolume: true });
            }
        
            else if (percentage == 100) {
                audio = createAudioResource(path.join(__dirname, '../../audio/getfucked.mp3'), { inlineVolume: true })
            }
        
            else if (percentage >= 80) {
                audio = createAudioResource(path.join(__dirname, '../../audio/ranald.mp3'), { inlineVolume: true });
            }

            audio.volume.setVolumeDecibels(7);

            player.play(audio);

        }, 1400);
    }

}

module.exports = { playRollSound, joinVoice, disconnectVoice, initialize: () => {
    console.log("Initializing audio player...");
    player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        }
    });

    player.on('playing', () => {
        
    });
    
    fs.readFile(path.join(__dirname, '../function-settings.json'), 'utf8', (error, jsonString) => {
        if (error) {
            console.warn(error);
            return error;
        }

        let settings = JSON.parse(jsonString);

        
        try {
            if (settings.connections) {
                settings.connections.forEach(connection => {
                    if (connection.channelId != 'none') {
                        console.log("Found active connection! Joining.");
                        setTimeout(() => {
                            joinVoice(connection.channelId, connection.guildId, true);
                        }, 1000)
                    }
                });
            } else {
                console.log("No active connections to join.")
            }
        } catch (error) {
            console.log(`There was an error when attempting connection. Error: ${error}`);
        }

    
    });


    console.log("Audio Player Initilalized");
}}
