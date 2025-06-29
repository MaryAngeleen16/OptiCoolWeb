const express = require("express");
const router = express.Router();
const controller = require("../controllers/groupedConsumptionController");

router.get("/grouped-raw", controller.getGroupedConsumptionRawData);

module.exports = router;