const mongoose = require("mongoose");

const OutsideHumiditySchema = new mongoose.Schema({
  humidity: Number,
  timestamp: Date
});

module.exports = mongoose.model("OutsideHumidity", OutsideHumiditySchema, "outsidehumidities");