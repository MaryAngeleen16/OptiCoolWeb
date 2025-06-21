const PowerConsumption = require('../models/PowerConsumption');
// GET /powerconsumptions - Get all power consumption records
exports.getAllPowerConsumptions = async (req, res) => {
  try {
    const consumptions = await PowerConsumption.find().sort({ timestamp: 1 });
    res.json(consumptions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch power consumption data.' });
  }
};

