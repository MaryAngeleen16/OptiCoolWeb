const express = require("express");
const router = express.Router();
const { getAllHumidity } = require("../controllers/HumidityController");

// Route to fetch all humidity data
router.get('/gethumidity', getAllHumidity);

module.exports = router;
