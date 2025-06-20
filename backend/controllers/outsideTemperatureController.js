const OutsideTemperature = require("../models/OutsideTemperature");

exports.getAllOutsideTemperatures = async (req, res) => {
  try {
    const temps = await OutsideTemperature.find().sort({ timestamp: 1 });
    res.status(200).json(temps);
  } catch (error) {
    res.status(500).json({ message: "Error fetching outside temperatures", error });
  }
};