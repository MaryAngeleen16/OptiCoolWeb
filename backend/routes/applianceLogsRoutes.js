const express = require("express");
const router = express.Router();
const { createApplianceLog, getAllApplianceLogs } = require("../controllers/applianceLogController");

// POST: Create a log
router.post("/", createApplianceLog);

// GET: Fetch all logs
router.get("/", getAllApplianceLogs);

module.exports = router;
