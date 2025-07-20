const axios = require("axios");

exports.getGroupedConsumptionRawData = async (req, res) => {
  try {
    const [power, reports, logs] = await Promise.all([
      axios.get(`${process.env.REACT_APP_API}/powerconsumptions`),
      axios.get(`${process.env.REACT_APP_API}/getreport`),
      axios.get(`${process.env.REACT_APP_API}/appliances`),
    ]);

    res.json({
      power: power.data,
      reports: reports.data.reports,
      logs: logs.data,
    });
  } catch (error) {
    console.error("Error fetching raw data for grouped consumption:", error);
    res.status(500).json({ error: "Failed to fetch raw data for grouped consumption." });
  }
};
