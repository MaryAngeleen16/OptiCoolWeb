import mongoose from "mongoose";

const applianceConsumptionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  appliance: String,
  totalDurationMinutes: Number,
  estimatedConsumptionKWh: Number,
});

export default mongoose.model("ApplianceConsumption", applianceConsumptionSchema);
