const express = require("express");
const path = require("path");
const log = require("custom-color-logs").print;

const trafficPolice = express.Router();
const sequrity = express.Router();
const inspect = express.Router();
const court = express.Router();
const border = express.Router();
const user = express.Router();

module.exports = { trafficPolice, sequrity, inspect, court, border, user };
