const express = require("express");
const router = express.Router();
const { getAllPowerConsumptions, addPowerConsumption} = require("../controllers/powerConsumptionController");

// Route to fetch all power consumption data
router.get('/getpowerconsumption', getAllPowerConsumptions);



router.get('/powerconsumptions', getAllPowerConsumptions);


module.exports = router;
