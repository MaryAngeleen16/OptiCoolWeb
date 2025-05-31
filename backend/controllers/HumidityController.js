const Humidity = require("../models/Humidity");

// Fetch all humidity data
exports.getAllHumidity = async (req, res) => {
  try {
    const humidityData = await Humidity.find().sort({ timestamp: -1 }); // Sort by latest
    res.status(200).json(humidityData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching humidity data", error });
  }
};
