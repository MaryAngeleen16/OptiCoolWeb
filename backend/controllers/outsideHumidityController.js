const OutsideHumidity = require("../models/OutsideHumidity");

exports.getAllOutsideHumidities = async (req, res) => {
  try {
    const humidities = await OutsideHumidity.find().sort({ timestamp: 1 });
    res.status(200).json(humidities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching outside humidities", error });
  }
};