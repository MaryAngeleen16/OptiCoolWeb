const Temperature = require("../models/Temperature");

// Fetch all temperature data (oldest to newest)
exports.getAllTemperature = async (req, res) => {
  try {
    const temperatureData = await Temperature.find().sort({ timestamp: 1 }); // Sort by oldest first
    res.status(200).json(temperatureData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching temperature data", error });
  }
};
