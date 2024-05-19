const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

require('dotenv').config();

const PORT = process.env.PORT || 5000;

const app = express();


// Discord App

require('./bot/bot-client.js').clientLogin();


// Website

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/roll', require('./api/roll.js'))


app.listen(PORT, () => {
    console.log(`\nWeb Server running on port ${PORT}...`);
});