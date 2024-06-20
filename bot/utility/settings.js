const Settings = require('../../models/settings-model.js');
const Users = require('../../models/users-model.js');


// ----- Get from database

async function GetSettings(guildId) {
    const settings = await Settings.findOne({ guildId: guildId });

    if (settings) {
        return settings;
    } else {
        return null;
    }
}

async function GetUserPrefs(userId) {
    const user = await Users.findOne({ userId: userId });

    if (user) {
        return user;
    } else {
        return null;
    }
}


// ----- Save to database

async function SaveSetting(guildId, setting, value) {
    
    const updatedSettings = await Settings.findOneAndUpdate(
        { guildId: guildId },
        { [setting]: value }
    );


    // If there is no updated setting object, it means there was no settings object for this guild, so make a new one.
    if (!updatedSettings) {
        console.log(`No database entry for guild ${guildId}, creating a new one.`)
        const guildSetting = new Settings({
            guildId: guildId,
            [setting]: value,
        })

        await guildSetting.save();
    }

    console.log("Settings saved successfully.")

    GetSettings(guildId);

    return;

}


/*  Save multiple settings in one database call
 *
 * @param settingValue An array of objects, ie [{setting: "name", value: "123"}, ...]
 * 
 */
async function SaveSettings(guildId, settingValue = [{}]) {
    
    const settings = await Settings.findOne({ guildId: guildId });

    if (settings) {
        settingValue.forEach(element => {
            settings[element.setting] = element.value
        });
    }

    settings.save();


    // If there is no updated setting object, it means there was no settings object for this guild, so make a new one.
    if (!settings) {
        console.log(`No database entry for guild ${guildId}, creating a new one.`)
        const guildSetting = new Settings({
            guildId: guildId,
        })
        
        settingValues.forEach(element => {
            settings[element.setting] = element.value
        });

        await guildSetting.save();
    }

    console.log("Settings saved successfully.")

    return;
    
}


async function SaveUserPrefs(userId, pref, value) {
    
    const updatedPreferences = await Users.findOneAndUpdate(
        { userId: userId },
        { [pref]: value }
    );


    // If there is no updated preferences object, it means there was no database entry for this user, so make a new one.
    if (!updatedPreferences) {
        console.log(`No database entry for user ${userId}, creating a new one.`)
        const userPrefs = new Users({
            userId: userId,
            [pref]: value,
        })

        await userPrefs.save();
    }

    console.log("User preferences saved successfully.")

    return;

}



module.exports = { SaveSetting, SaveSettings, SaveUserPrefs, GetSettings, GetUserPrefs }