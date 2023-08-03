const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const launches = new Map();

let latestFlightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: 'Kepler Explorer',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customer: ['DDH', 'NASA'],
    upcoming: true,
    success: true
}

// Save launch
saveLunch(launch);

async function saveLunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target
    })

    //This if check handles referential intergrity in when working with MongoDb
    // The purpose of this is to validate if a planet exist first before adding it.
    if (!planet) {
        throw new Error('No matching planet was found');
    }

    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    })
}

// if launchId exists
async function existsLaunchWithId(launchId) {
    return await launchesDatabase.findOne({
        flightNumber: launchId
    });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne({})
        // sort the flight number in descending order to get the latest flightNumber.
        .sort('-flightNumber');

    if (!latestFlightNumber) {
        DEFAULT_FLIGHT_NUMBER
    }

    return latestLaunch.flightNumber;
}

async function getAllLaunches() {
    return await launchesDatabase.find({}, {
        '_id': 0,
        '__v': 0
    })
}
// Function to add new launch to db
async function scheduleNewLaunch(launch) {
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customer: ['DDH', 'NASA'],
        flightNumber: newFlightNumber
    })

    await saveLunch(newLaunch);
}

// function to remove id
async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false
    });

    console.log(aborted)
    return aborted.modifiedCount === 1;
}

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    launches,
    abortLaunchById
}