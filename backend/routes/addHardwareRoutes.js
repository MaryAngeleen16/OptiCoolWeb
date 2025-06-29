const express = require('express');
const router = express.Router();
const addHardwareController = require('../controllers/addHardwareController');

// Add new hardware
router.post('/', addHardwareController.createHardware);

// Update hardware
router.put('/:id', addHardwareController.updateHardware);

// Delete hardware
router.delete('/:id', addHardwareController.deleteHardware);

// Get all hardware
router.get('/', addHardwareController.getAllHardware);

module.exports = router;
