import mongoose from 'mongoose';

const applianceConsumptionSchema = new mongoose.Schema({
  appliance: { type: String, required: true },
  energy_wh: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }, // When this data was recorded
});

export default mongoose.model('ApplianceConsumption', applianceConsumptionSchema);
