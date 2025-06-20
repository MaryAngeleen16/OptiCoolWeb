const express = require("express");
const router = express.Router();
const controller = require("../controllers/outsideHumidityController");

router.get("/outsidehumidities", controller.getAllOutsideHumidities);

module.exports = router;