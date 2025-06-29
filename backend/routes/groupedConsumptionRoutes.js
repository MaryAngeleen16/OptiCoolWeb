const express = require("express");
const router = express.Router();
const { getGroupedConsumptions } = require("../controllers/groupedConsumptionController");

router.get("/grouped-consumptions", getGroupedConsumptions);

module.exports = router;