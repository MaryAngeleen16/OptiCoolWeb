const express = require("express");
const router = express.Router();
const controller = require("../controllers/insideTemperatureController");

router.get("/insidetemperatures", controller.getAllInsideTemperatures);

module.exports = router;