const dotenv = require('dotenv');
dotenv.config()
const mongoose = require('mongoose');

mongoose.connection.once('open', () => {
    console.log('MongoDB connection ready!')
});

mongoose.connection.on('error', (err) => {
    console.error(err)
})

const mongo_URL = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@nasa-project.my2ox9h.mongodb.net/nasa?retryWrites=true&w=majority`

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