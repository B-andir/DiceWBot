const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const PORT = process.env.PORT || 5000;

const app = express();

// Connect to Database

mongoose.connect(process.env.MONGODB_URI).then(()=> {
    console.log("Connected to MongoDB Cluster");
})

// Discord App

require('./bot/bot-client.js').clientLogin();


// Website

app.use(bodyParser.json());

app.post('/api/secrets', require('./api/get-secrets.js'));
app.post('/api/bot-guilds', require('./api/get-bot-guilds.js'));
app.post('/api/roll-percent', require('./api/roll-percent.js'));
app.post('/api/roll-dice', require('./api/roll-dice.js'));

app.listen(PORT, () => {
    console.log(`\nWeb Server running on port ${PORT}...`);
});