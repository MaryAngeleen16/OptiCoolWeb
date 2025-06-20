const express = require("express");
const router = express.Router();
const controller = require("../controllers/outsideTemperatureController");

router.get("/outsidetemperatures", controller.getAllOutsideTemperatures);

module.exports = router;