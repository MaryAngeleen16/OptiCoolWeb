const InsideTemperature = require("../models/InsideTemperature");

exports.getAllInsideTemperatures = async (req, res) => {
  try {
    const temps = await InsideTemperature.find().sort({ timestamp: 1 });
    res.status(200).json(temps);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inside temperatures", error });
  }
};