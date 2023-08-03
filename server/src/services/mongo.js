const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready!')
});

mongoose.connection.on('error', (err) => {
    console.error(err)
})

const mongo_URL = process.env.mongo_URL;

async function mongoConnect() {
    await mongoose.connect(mongo_URL);
}

async function mongoDisconnect() {
    await mongoose.disconnect()
}

module.exports = {
    mongoConnect,
    mongoDisconnect
};