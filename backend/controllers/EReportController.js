const Report = require('../models/EReport');  // Import your Report model
const User = require('../models/User');
const moment = require('moment-timezone'); // Import moment-timezone for time formatting


exports.reportSent = async (req, res, next) => {
  try {
    console.log("Raw Request Body:", req.body);

    const { appliance, status, user, timeReported, description } = req.body;

    // Validate required fields
    if (!appliance || !status || !user || !timeReported || !description) {
      console.log("Missing required fields:", {
        appliance,
        status,
        user,
        timeReported,
        description
      });
      return res.status(400).json({
        message: 'Appliance, status, user, timeReported, and description are required.'
      });
    }

    // Check if user exists
    const userData = await User.findById(user);
    if (!userData) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Create and save the report
    const newReport = await Report.create({
      appliance,
      status,
      description,
      reportDate: new Date(),
      timeReported,
      user: userData._id,
    });

    console.log("Saved in MongoDB:", newReport);

    return res.status(201).json({
      message: 'Report successfully submitted',
      success: true,
    });
  } catch (err) {
    console.error("Error submitting report:", err.message);
    return res.status(400).json({
      message: 'Something went wrong while submitting the report. Please try again later.',
      success: false,
    });
  }
};


exports.getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('user', 'username email')  // populate username and email from User model
      .sort({ reportDate: -1 });           // sort by latest reports

    if (!reports || reports.length === 0) {
      return res.status(404).json({
        message: 'No reports found.',
        success: false,
      });
    }

    // Optionally map to format if needed
    const formattedReports = reports.map((report) => ({
      _id: report._id,
      appliance: report.appliance,
      description: report.description,
      status: report.status,
      isResolved: report.isResolved,
      timeReported: report.timeReported,
      reportDate: report.reportDate,
      user: {
        _id: report.user._id,
        username: report.user.username,
        email: report.user.email,
      },
    }));

    return res.status(200).json({
      reports: formattedReports,
      success: true,
    });
  } catch (err) {
    console.error("Error fetching reports:", err.message);
    return res.status(500).json({
      message: 'Something went wrong while fetching the reports. Please try again later.',
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

exports.markReportResolved = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Report.findByIdAndUpdate(
      id,
      { isResolved: "yes" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found." });
    }

    return res.status(200).json({
      message: "Report marked as resolved.",
      report: updated,
    });
  } catch (err) {
    console.error("Error updating report:", err);
    return res.status(500).json({
      message: "Failed to mark report as resolved.",
      error: err.message,
    });
  }
};
