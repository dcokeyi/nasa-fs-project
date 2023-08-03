const express = require('express');

const planetsController = require('./planets.controller')

const { httpGetAllPlanets } = planetsController

const planetsRouter = express.Router();

planetsRouter.get('/', httpGetAllPlanets);

module.exports = planetsRouter;