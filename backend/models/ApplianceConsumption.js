const mongoose = require("mongoose");

const applianceConsumptionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  appliance: {
    type: String,
    required: true,
  },
  totalDurationMinutes: {
    type: Number,
    required: true,
  },
  estimatedConsumptionKWh: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("ApplianceConsumption", applianceConsumptionSchema);
