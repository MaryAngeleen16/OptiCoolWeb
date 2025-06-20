const express = require("express");
const router = express.Router();
const controller = require("../controllers/insideHumidityController");

router.get("/insidehumidities", controller.getAllInsideHumidities);

module.exports = router;