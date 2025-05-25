const express = require("express");
const router = express.Router();
const { getAllPowerConsumptions, getPowerConsumptionByDate} = require("../controllers/powerConsumptionController");

// Route to fetch all power consumption data
router.get('/getpowerconsumption', getAllPowerConsumptions);

// Route to fetch power consumption by date range
router.get('/range', getPowerConsumptionByDate);


module.exports = router;
