require('dotenv').config();
const express = require('express');
// const WavesAPI = require('@waves/waves-api')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mail = require('./mail');
const usersRouter = require('./src/routes/users');

mongoose.connect(`mongodb+srv://admin:${process.env.MONGO_ATLAS_PASS
}@wavekeeper-s2crb.mongodb.net/test?retryWrites=true`,
{ useNewUrlParser: true }).catch(err => console.log(err));
mongoose.set('useCreateIndex', true);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(usersRouter);

// app.get('/create-smart-contract', async (req, res) => {
//
// });

app.get('/send', (req, res) => {
  mail.main().catch(console.error);
});

module.exports = app;
