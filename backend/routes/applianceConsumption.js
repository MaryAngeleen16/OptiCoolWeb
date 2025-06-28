import express from 'express';
import ApplianceConsumption from '../models/ApplianceConsumption.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const entries = req.body.data; // array of { appliance, energy_wh }

    const saved = await ApplianceConsumption.insertMany(
      entries.map(entry => ({
        ...entry,
        timestamp: new Date(), // Optional, overwrite with now
      }))
    );

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
