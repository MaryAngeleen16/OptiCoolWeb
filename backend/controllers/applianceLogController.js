const ApplianceLog = require("../models/ApplianceLog");

// CREATE a new log
exports.createApplianceLog = async (req, res) => {
  try {
    const { appliance, action, user } = req.body;

    if (!appliance || !action || !user) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const log = new ApplianceLog({
      appliance,
      action,
      user,
    });

    await log.save();
    res.status(201).json({ success: true, message: "Appliance log created", data: log });
  } catch (error) {
    console.error("Error creating appliance log:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllApplianceLogs = async (req, res) => {
  try {
    const logs = await ApplianceLog.find().populate("user", "username email").sort({ timestamp: -1 });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching appliance logs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
