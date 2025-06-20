const mongoose = require("mongoose");

const OutsideTemperatureSchema = new mongoose.Schema({
  temperature: Number,
  timestamp: Date
});

module.exports = mongoose.model("OutsideTemperature", OutsideTemperatureSchema, "outsidetemperatures");
// The third argument ensures it uses the "outsidetemperatures" collection