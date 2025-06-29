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
  const lower = action.toLowerCase();
  if (lower.includes("toggled")) {
    const match = action.match(/Toggled (.*?) (On|Off)/i);
    if (match) {
      return {
        appliance: match[1].trim(),
        state: match[2].toUpperCase()
      };
    }
  }
  return null;
}

function getUsageSessions(logs) {
  const sessions = {}; // appliance => [{start, end}]

  logs.forEach(log => {
    const parsed = parseAction(log.action);
    if (!parsed) return;

    const { appliance, state } = parsed;
    if (!sessions[appliance]) sessions[appliance] = [];

    if (state === "ON") {
      sessions[appliance].push({ start: new Date(log.timestamp), end: null });
    } else if (state === "OFF") {
      const lastSession = sessions[appliance].reverse().find(s => !s.end);
      if (lastSession) lastSession.end = new Date(log.timestamp);
      sessions[appliance].reverse();
    }
  });

  return sessions;
}

function estimateConsumption(sessions, wattage) {
  const result = [];

  for (const [appliance, periods] of Object.entries(sessions)) {
    const power = wattage[appliance] || 0;
    let totalMinutes = 0;

    periods.forEach(({ start, end }) => {
      if (!end) return;
      const durationMin = (end - start) / 60000;
      totalMinutes += durationMin;
    });

    const kwh = (power * totalMinutes) / 60 / 1000;

    result.push({
      appliance,
      totalDurationMinutes: totalMinutes,
      estimatedConsumptionKWh: kwh
    });
  }

  return result;
}

exports.createApplianceConsumption = async (req, res) => {
  try {
    const { data: logRes } = await axios.get("https://opticoolweb-backend.onrender.com/api/v1/activity-log");
    const logs = logRes.logs;

    const sessions = getUsageSessions(logs);
    const estimations = estimateConsumption(sessions, wattage);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const saved = await Promise.all(
      estimations.map(async (entry) => {
        const log = new ApplianceConsumption({
          appliance: entry.appliance,
          totalDurationMinutes: entry.totalDurationMinutes,
          estimatedConsumptionKWh: entry.estimatedConsumptionKWh,
          date: today
        });
        return await log.save();
      })
    );

    res.status(201).json({ success: true, records: saved });
  } catch (err) {
    console.error("Create Consumption Error:", err);
    res.status(500).json({ success: false, message: "Failed to calculate consumption" });
  }
};

exports.getApplianceConsumption = async (req, res) => {
  try {
    const { appliance } = req.query;
    const filter = appliance ? { appliance } : {};

    const records = await ApplianceConsumption.find(filter).sort({ date: -1 });

    res.status(200).json({ success: true, records });
  } catch (err) {
    console.error("Fetch Consumption Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch consumption records" });
  }
};
