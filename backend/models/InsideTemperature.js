const mongoose = require("mongoose");

const InsideTemperatureSchema = new mongoose.Schema({
  temperature: Number,
  timestamp: Date
});

module.exports = mongoose.model("InsideTemperature", InsideTemperatureSchema, "insidetemperatures");
