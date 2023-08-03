const {
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById
} = require('../../models/launches.model');

async function httpGetAllLaunches(req, res) {
    return res.status(200).json(await getAllLaunches());
}

async function httpAddNewLaunch(req, res) {
    const launch = req.body;
    const { mission, rocket, launchDate, target } = launch;

    if (!mission || !rocket || !launchDate || !target) {
        return res.status(400).json({
            error: "Missing required lauch property"
        });
    };

    launch.launchDate = new Date(launch.launchDate);
    if (launch.launchDate.toString() === 'Invalid Date') {
        return res.status(400).json({
            error: 'Invalid Launch Date',
        })
    }

    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
    const launchId = Number(req.params.id);
    const exists = await existsLaunchWithId(launchId)

    // if launch doesnt exist
    if (!exists) {
        return res.status(404).json({
            error: 'Launch not found',
        });
    }

    // if launch exists
    const aborted = await abortLaunchById(launchId)
    if (aborted) {
        return res.status(400).json({
            error: 'Launch not aborted'
        })
    } else {
        return res.status(200).json({
            ok: true
        })
    }
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}