const mongoose = require('mongoose');

const applianceLogSchema = new mongoose.Schema({
  appliance: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['on', 'off'],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ApplianceLog', applianceLogSchema);
