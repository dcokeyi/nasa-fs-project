const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan')

const api = require('./routes/api')

const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}))
//For logging activities and errors
app.use(morgan('combined'))

app.use(express.json());

// Load the build file for the client
app.use(express.static(path.join(__dirname, '..', 'public')))

// Use router for versioned api
app.use('/v1', api)

// Load the client so that the homepage will the localhost:5000 route.
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

module.exports = app; 