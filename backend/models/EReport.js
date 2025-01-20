const mongoose = require('mongoose');

const ereportSchema = new mongoose.Schema({
    appliance: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    reportDate: {
        type: Date,
        default: Date.now,  // Automatically set the report date
    },
    reportTime: {
        type: String,  // You can use String to store time in HH:mm format
        default: () => {
            const now = new Date();
            return now.toTimeString().slice(0, 5);
        }
    }
});

module.exports = mongoose.model('EReport', ereportSchema);

