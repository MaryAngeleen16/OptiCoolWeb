const express = require("express");
const router = express.Router();
const { getAllPowerConsumptions} = require("../controllers/powerConsumptionController");



router.get('/powerconsumptions', getAllPowerConsumptions);


module.exports = router;
