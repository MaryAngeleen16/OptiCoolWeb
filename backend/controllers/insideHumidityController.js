const InsideHumidity = require("../models/InsideHumidity");

exports.getAllInsideHumidities = async (req, res) => {
  try {
    const humidities = await InsideHumidity.find().sort({ timestamp: 1 });
    res.status(200).json(humidities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inside humidities", error });
  }
};