const Log = require('../models/Log');
const User = require('../models/User'); // Ensure you have a User model

exports.createLog = async (req, res) => {
    try {
        const { user, action } = req.body;

        // Ensure the user exists
        const userData = await User.findById(user);
        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const log = await Log.create({
            user,
            action,
            timestamp: new Date(),
        });

        res.status(201).json({ success: true, log });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create log', error: error.message });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const logs = await Log.find({}).populate('user', 'username email'); // Populate user details
        res.status(200).json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch logs', error: error.message });
    }
};
