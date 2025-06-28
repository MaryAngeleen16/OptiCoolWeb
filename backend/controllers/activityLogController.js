const ActivityLog = require("../models/ActivityLog");

exports.createActivityLog = async (req, res) => {
  try {
    const { userId, action, timestamp } = req.body;

    const log = new ActivityLog({
      userId,
      action,
      timestamp: timestamp || Date.now(),
    });

    const savedLog = await log.save();

    // Re-fetch the saved log and populate the user
    const populatedLog = await ActivityLog.findById(savedLog._id).populate(
      "userId",
      "username email"
    );

    res.status(201).json({ success: true, log: populatedLog });
  } catch (err) {
    console.error("Create Log Error:", err);
    res.status(500).json({ success: false, message: "Failed to create log" });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const { userId } = req.query;

    const filter = userId ? { userId } : {};

    const logs = await ActivityLog.find(filter)
      .populate("userId", "username email")
      .sort({ timestamp: -1 });

    res.status(200).json({ success: true, logs });
  } catch (err) {
    console.error("Fetch Logs Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
};