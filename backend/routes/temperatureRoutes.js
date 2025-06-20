const express = require("express");
const router = express.Router();
const { getAllTemperature } = require("../controllers/TemperatureController");


// Route to fetch all temperature data
router.get('/gettemperature', getAllTemperature);

module.exports = router;
