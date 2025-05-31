const mongoose = require("mongoose");

const temperatureSchema = new mongoose.Schema({
  temperature: { type: Number, required: true }, // Temperature value
  timestamp: { type: Date, default: Date.now },  // Time of recording
});

const Temperature = mongoose.model("Temperature", temperatureSchema);

module.exports = Temperature;
