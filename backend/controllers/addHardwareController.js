const AddHardware = require('../models/AddHardware');

// Create new hardware
exports.createHardware = async (req, res) => {
  try {
    const hardware = await AddHardware.create(req.body);
    res.status(201).json(hardware);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update hardware
exports.updateHardware = async (req, res) => {
  try {
    const hardware = await AddHardware.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hardware) return res.status(404).json({ error: 'Hardware not found' });
    res.json(hardware);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete hardware
exports.deleteHardware = async (req, res) => {
  try {
    const hardware = await AddHardware.findByIdAndDelete(req.params.id);
    if (!hardware) return res.status(404).json({ error: 'Hardware not found' });
    res.json({ message: 'Hardware deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all hardware
exports.getAllHardware = async (req, res) => {
  try {
    const hardware = await AddHardware.find();
    res.json(hardware);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
