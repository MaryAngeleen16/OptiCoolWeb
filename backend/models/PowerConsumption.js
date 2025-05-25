const mongoose = require("mongoose");

const powerConsumptionSchema = new mongoose.Schema({
  consumption: { type: Number, required: true }, // Power consumption value
  timestamp: { type: Date, default: Date.now }, // Time of recording
});

const PowerConsumption = mongoose.model("PowerConsumption", powerConsumptionSchema);

module.exports = PowerConsumption;