const express = require("express");
const router = express.Router();
const activityLogController = require("../controllers/activityLogController");

router.post("/", activityLogController.createActivityLog);
router.get("/", activityLogController.getActivityLogs);

module.exports = router;