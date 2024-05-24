const fs = require('node:fs');
const path = require('node:path');

var settingsCache;

async function UpdateCache() {
    
    fs.readFile(path.join(__dirname, '../function-settings.json'), 'utf8', (error, jsonString) => {
        if (error) {
            if (error.code == "ENOENT") {
                fs.writeFile(path.join(__dirname, '../function-settings.json'), "{}", { flag: 'wx' }, (err) => {
                    if (err) throw err;

                    console.log('No existing function-settings.json file was found. A new one was made instead.')
                    settingsCache = {}
                    return settingsCache;
                });
            }
            console.warn(error);

            return error;

        }

        settingsCache = JSON.parse(jsonString);
        console.log("Settings Cache Updated.")

        return settingsCache;
    });

}

async function SaveSettings(newData) {

    if (!newData || newData === "" || JSON.stringify(newData).length < 5) {
        let error = "Tried to save empty settings! Aborting save";
        console.warn(error);
        return error;
    }

    settingsCache = newData;

    fs.writeFile(path.join(__dirname, '../function-settings.json'), JSON.stringify(newData, null, 4), async (error) => {
        if (error) {
            console.log(`Error writing to file: ${error}`);
            return error;
        }

        console.log('Data has been successfully saved to the function-settings.json file.')
    });

}


function GetCachedSettings() {
    return settingsCache;
}

module.exports = { UpdateCache, GetCachedSettings, SaveSettings }