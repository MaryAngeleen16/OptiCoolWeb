const ApplianceConsumption = require("../models/ApplianceConsumption");
const axios = require("axios");

const wattage = {
  "AC 1": 1850,
  "AC 2": 1510,
  "Fan 1": 65,
  "Fan 2": 65,
  "Fan 3": 65,
  "Fan 4": 65,
  "Exhaust 1": 50,
  "Exhaust 2": 50,
  "Blower 1": 200
};

function parseAction(action) {
  const match = action.match(/Toggled (.*?) (On|Off)/i);
  if (!match) return null;
  return {
    appliance: match[1].trim(),
    state: match[2].toUpperCase()
  };
}

exports.createApplianceConsumption = async (req, res) => {
  try {
    const { date } = req.query; // e.g. 2025-03-21
    if (!date) return res.status(400).json({ success: false, message: "Missing date" });

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const [powerRes, logRes] = await Promise.all([
      axios.get("https://opticoolweb-backend.onrender.com/api/v1/powerconsumptions"),
      axios.get("https://opticoolweb-backend.onrender.com/api/v1/activity-log")
    ]);

    // === Step 1: Filter power logs and subtract light usage ===
    const powerLogs = powerRes.data.powerConsumptionLogs.filter(log => {
      const ts = new Date(log.timestamp);
      return ts >= dayStart && ts < dayEnd;
    });

    const LIGHT_USAGE_KWH = 0.5;
    const totalPowerKWh = powerLogs.reduce((sum, p) => sum + (p.totalPowerConsumption || 0), 0);
    const adjustedKWh = totalPowerKWh - LIGHT_USAGE_KWH;

    // === Step 2: Parse appliance ON/OFF from logs ===
    const logs = logRes.data.logs.filter(log => {
      const ts = new Date(log.timestamp);
      return ts >= dayStart && ts < dayEnd;
    });

    const stateMap = {}; // appliance => ON/OFF

    logs.forEach((log) => {
      const parsed = parseAction(log.action);
      if (!parsed) return;
      stateMap[parsed.appliance] = parsed.state;
    });

    const onAppliances = Object.entries(stateMap)
      .filter(([_, state]) => state === "ON")
      .map(([appliance]) => appliance);

    if (onAppliances.length === 0) {
      return res.status(200).json({ success: true, message: "No appliances were ON" });
    }

    const totalWattage = onAppliances.reduce((sum, a) => sum + (wattage[a] || 0), 0);

    const todayDate = new Date(dayStart); // use midnight version

    const estimations = await Promise.all(
      onAppliances.map(async (appliance) => {
        const share = (wattage[appliance] / totalWattage) * adjustedKWh;
        const log = new ApplianceConsumption({
          appliance,
          totalDurationMinutes: null,
          estimatedConsumptionKWh: parseFloat(share.toFixed(4)),
          date: todayDate
        });
        return await log.save();
      })
    );

    res.status(201).json({ success: true, saved: estimations });
  } catch (err) {
    console.error("Create Consumption Error:", err);
    res.status(500).json({ success: false, message: "Error calculating consumption" });
  }
};
