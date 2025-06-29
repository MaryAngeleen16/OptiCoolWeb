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
    const [logRes, powerRes] = await Promise.all([
      axios.get("https://opticoolweb-backend.onrender.com/api/v1/activity-log"),
      axios.get("https://opticoolweb-backend.onrender.com/api/v1/powerconsumptions")
    ]);

    const logs = logRes.data.logs;
    const powerLogs = powerRes.data.powerConsumptionLogs || [];

    // 1. Filter only today's total power consumption
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = powerLogs.filter(log => new Date(log.timestamp) >= today);

    // 2. Compute total power used today (excluding lights)
    const totalKWhToday = todayLogs.reduce((sum, entry) => {
      return sum + (entry.totalPowerConsumption ?? 0);
    }, 0);

    // Optional: Subtract estimated light usage here if needed
    const estimatedLightUsage = 0; // adjust if needed
    const adjustedKWh = totalKWhToday - estimatedLightUsage;

    // 3. Find ON appliances (based on logs and sessions)
    const sessions = getUsageSessions(logs); // Already using parseAction()

    // 4. Flatten session durations in minutes
    const activeDurations = {};
    for (const [appliance, periods] of Object.entries(sessions)) {
      let totalMinutes = 0;
      periods.forEach(({ start, end }) => {
        if (!end) return;
        totalMinutes += (end - start) / 60000;
      });
      if (totalMinutes > 0) {
        activeDurations[appliance] = totalMinutes;
      }
    }

    // 5. Total ON wattage-time
    let totalWattMinutes = 0;
    for (const [appliance, minutes] of Object.entries(activeDurations)) {
      totalWattMinutes += (wattage[appliance] || 0) * minutes;
    }

    // 6. Estimate each appliance's contribution
    const estimations = [];
    for (const [appliance, minutes] of Object.entries(activeDurations)) {
      const watt = wattage[appliance] || 0;
      const kWh = (watt * minutes / totalWattMinutes) * adjustedKWh;

      estimations.push({
        appliance,
        totalDurationMinutes: minutes,
        estimatedConsumptionKWh: parseFloat(kWh.toFixed(4))
      });
    }

    // 7. Save results
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
    const { appliance, fromDate } = req.query;
    const filter = {};

    if (appliance) filter.appliance = appliance;
    if (fromDate) filter.date = { $gte: new Date(fromDate) };

    const records = await ApplianceConsumption.find(filter).sort({ date: -1 });

    res.status(200).json({ success: true, records });
  } catch (err) {
    console.error("Fetch Consumption Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch consumption records" });
  }
};

