const Report = require('../models/EReport');  // Import your Report model
const User = require('../models/User');
const moment = require('moment-timezone'); // Import moment-timezone for time formatting

// exports.sendReport = async (req, res, next) => {
//     try {
//         console.log(req.body); 
//         const { appliance, status } = req.body;  

//         if (!appliance || !status) {
//             return res.status(400).json({ message: 'Appliance and status are required.' });
//         }

       
//         const newReport = await Report.create({
//             appliance,
//             status,
//             reportDate: new Date(),  
//         });

//         if (!newReport) {
//             return res.status(400).json({ message: 'Report could not be created.' });
//         }

//         return res.status(201).json({ message: 'Report successfully submitted', success: true }); // Success response
//     } catch (err) {
//         console.error(err);  
//         return res.status(400).json({
//             message: 'Something went wrong while submitting the report. Please try again later.',
//             success: false,
//         });
//     }
// };

// exports.getAllReports = async (req, res, next) => {
//     try {
//         const reports = await Report.find();

//         if (!reports || reports.length === 0) {
//             return res.status(404).json({ message: 'No reports found.' });
//         }

//         return res.status(200).json({ reports });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({
//             message: 'Something went wrong while fetching the reports. Please try again later.',
//             success: false,
//         });
//     }
// };








exports.reportSent = async (req, res, next) => {
    try {
        console.log("Raw Request Body:", req.body);

        const { appliance, status, user, timeReported } = req.body;  // Destructure appliance, status, user, and timeReported from the request body

        if (!appliance || !status || !user || !timeReported) {
            console.log("Missing required fields:", { appliance, status, user, timeReported }); // Log missing fields
            return res.status(400).json({ message: 'Appliance, status, user, and timeReported are required.' });
        }

        const userData = await User.findById(user);
        if (!userData) {
            return res.status(404).json({ message: 'User not found.' });
        }

        console.log("Time Reported:", timeReported); // Log the timeReported value

        // Create a new report
        const newReport = await Report.create({
            appliance,
            status,
            reportDate: new Date(),  // Optional: you can store the report's timestamp
            timeReported: timeReported, // Ensure it's named correctly
            user: userData._id,  // Store only user ID
        });

        console.log("Saved in MongoDB:", await Report.findById(newReport._id));

        if (!newReport) {
            return res.status(400).json({ message: 'Report could not be created.' });
        }

        return res.status(201).json({ message: 'Report successfully submitted', success: true }); // Success response
    } catch (err) {
        console.error("Error submitting report:", err.message);  // Log error for debugging purposes
        return res.status(400).json({
            message: 'Something went wrong while submitting the report. Please try again later.',
            success: false,
        });
    }
    
};








exports.getAllReports = async (req, res, next) => {
    try {
        const reports = await Report.find()
            .populate('user', 'username email') // Populate user email and username
            .sort({ reportDate: -1 }); // Sort by reportDate in descending order

        if (!reports || reports.length === 0) {
            return res.status(404).json({ message: 'No reports found.' });
        }

        console.log("Fetched Reports:", reports); // Log the fetched reports

        return res.status(200).json({ reports });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Something went wrong while fetching the reports. Please try again later.',
            success: false,
        });
    }
};