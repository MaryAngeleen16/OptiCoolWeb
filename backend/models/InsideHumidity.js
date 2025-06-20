const mongoose = require("mongoose");

const InsideHumiditySchema = new mongoose.Schema({
  humidity: Number,
  timestamp: Date
});

module.exports = mongoose.model("InsideHumidity", InsideHumiditySchema, "insidehumidities");