const express = require("express");
const router = express.Router();

const {
  createApplianceConsumption,
  getApplianceConsumption
} = require("../controllers/calculateConsumptionController.js");

router.post("/appliance-consumption", createApplianceConsumption);
router.get("/appliance-consumption", getApplianceConsumption);

module.exports = router;
