
const express = require('express');
const session = require('express-session');

require('dotenv').config();


const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.static('public'));

const botClient = require('./bot/bot-client.js');
botClient;


app.listen(PORT, () => {
    console.log(`\nWeb Server running on port ${PORT}...`);
});