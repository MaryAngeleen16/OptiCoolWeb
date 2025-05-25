const PowerConsumption = require("../models/PowerConsumption");

// Fetch all power consumption data
exports.getAllPowerConsumptions = async (req, res) => {
  try {
    const powerData = await PowerConsumption.find().sort({ timestamp: -1 }); // Sort by latest
    res.status(200).json(powerData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching power consumption data", error });
  }
};

// Fetch power consumption between specific dates
exports.getPowerConsumptionByDate = async (req, res) => {
  try {
    const { start, end } = req.query; // Get dates from query params
    const powerData = await PowerConsumption.find({
      timestamp: { $gte: new Date(start), $lte: new Date(end) },
    }).sort({ timestamp: 1 });

    res.status(200).json(powerData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching power data", error });
  }
};

