const mongoose = require('mongoose');

const addHardwareSchema = new mongoose.Schema({
  Appliance: {
    type: String,
    required: true
  },
  Watts: {
    type: Number,
    required: true
  },
  Type: {
    type: String,
    enum: ['AC', 'Fan', 'Exhaust', 'Blower', 'Lights', 'Others'],
    required: true
  }
});

module.exports = mongoose.model('AddHardware', addHardwareSchema);
