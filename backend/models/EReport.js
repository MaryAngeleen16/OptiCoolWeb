const mongoose = require('mongoose');

const ereportSchema = new mongoose.Schema({
    appliance: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        required: true,
    },
    isResolved: {
        type: String,
        enum: ['yes', 'no'],
        default: 'no', 
    },
    reportDate: {
        type: Date,
        default: Date.now,  
    },
    timeReported: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

module.exports = mongoose.model('EReport', ereportSchema);
