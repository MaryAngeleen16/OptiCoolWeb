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

// POST /powerconsumptions - Add a new power consumption record
exports.addPowerConsumption = async (req, res) => {
  try {
    const { consumption, timestamp } = req.body;
    const newConsumption = new PowerConsumption({ consumption, timestamp });
    await newConsumption.save();
    res.status(201).json(newConsumption);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add power consumption data.' });
  }
};

