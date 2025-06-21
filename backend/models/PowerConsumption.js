const mongoose = require("mongoose");

const powerconsumptionSchema = new mongoose.Schema({
  consumption: { type: Number, required: true },
  timestamp: { type: Date, required: true }
});

const PowerConsumption = mongoose.model("PowerConsumption", powerconsumptionSchema);

module.exports = PowerConsumption;