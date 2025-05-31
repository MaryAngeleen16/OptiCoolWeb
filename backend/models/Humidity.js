const mongoose = require("mongoose");

const humiditySchema = new mongoose.Schema({
  humidity: { type: Number, required: true }, // Humidity value
  timestamp: { type: Date, default: Date.now }, // Time of recording
});

const Humidity = mongoose.model("Humidity", humiditySchema);

module.exports = Humidity;