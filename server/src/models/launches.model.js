const axios = require('axios')

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const launches = new Map();

let latestFlightNumber = 100;

// Function is responsible for the request made to the spaveX Api

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log('Problem downloading launch data');

        throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
        // Since individual items have their own payloads
        // the purpose of this code is to combine all the payloads into a single array
        // this would be used to retrieve the customers
        const payloads = launchDoc['payloads'];

        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        })

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers
        };

        console.log(`${launch.flightNumber} ${launch.mission}`);

        await saveLunch(launch);
    }
}

async function loadLaunchData() {
    // This function is to check if items have already exist within DB in order to minimize API load
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    })

    if (firstLaunch) {
        console.log('Launch data already loaded');
    } else {
        await populateLaunches();
    }

}

// Function resposible for finding an item within a database
async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter)
}

async function saveLunch(launch) {
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    })
}

// if launchId exists
async function existsLaunchWithId(launchId) {
    return await findLaunch({
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

async function getAllLaunches(skip, limit) {
    return await launchesDatabase
        .find({}, { '_id': 0, '__v': 0 })
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit);
}
// Function to add new launch to db
async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target
    })

    //This if check handles referential intergrity in when working with MongoDb
    // The purpose of this is to validate if a planet exist first before adding it.
    if (!planet) {
        throw new Error('No matching planet was found');
    }

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
    loadLaunchData,
    scheduleNewLaunch,
    launches,
    abortLaunchById
}