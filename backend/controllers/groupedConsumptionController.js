const axios = require("axios");
const moment = require("moment");

const FULL_WATTAGE = {
  "AC 1": 1850,
  "AC 2": 1510,
  "Fan 1": 65,
  "Fan 2": 65,
  "Fan 3": 65,
  "Fan 4": 65,
  "Exhaust 1": 50,
  "Exhaust 2": 50,
  "Blower": 200,
};

const GROUP_MAP = {
  "AC 1": "ACs",
  "AC 2": "ACs",
  "Fan 1": "Fans",
  "Fan 2": "Fans",
  "Fan 3": "Fans",
  "Fan 4": "Fans",
  "Exhaust 1": "Exhausts",
  "Exhaust 2": "Exhausts",
  "Blower": "Blowers",
};

function computeEnergy(watts, msDuration) {
  const hours = msDuration / (1000 * 60 * 60);
  return (watts * hours) / 1000;
}

function getACName(label) {
  if (label.toLowerCase().includes("midea")) return "AC 1";
  if (label.toLowerCase().includes("carrier")) return "AC 2";
  return null;
}

exports.getGroupedConsumptions = async (req, res) => {
  try {
    const [powerRes, reportRes, applianceLogRes] = await Promise.all([
      axios.get("https://opticoolweb-backend.onrender.com/api/v1/powerconsumptions"),
      axios.get("https://opticoolweb-backend.onrender.com/api/v1/getreport"),
      axios.get("https://opticoolweb-backend.onrender.com/api/v1/application-logs"),
    ]);

    const powerData = powerRes.data
      .filter((p) => new Date(p.timestamp) >= new Date("2025-03-21"))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const totalKwh =
      powerData.length > 1
        ? powerData[powerData.length - 1].consumption - powerData[0].consumption
        : 0;

    // Identify broken ACs from unresolved inactive reports
    const brokenSet = new Set();
    for (const report of reportRes.data.reports) {
      const ac = getACName(report.appliance);
      if (ac && report.status === "inactive" && report.isResolved === "no") {
        brokenSet.add(ac);
      }
    }

    // Appliance log processing
    const applianceLogs = applianceLogRes.data
      .filter((log) => new Date(log.timestamp) >= new Date("2025-06-28"))
      .map((log) => ({
        appliance: log.appliance,
        action: log.action,
        timestamp: new Date(log.timestamp),
      }));

    // Filter devices to exclude broken ones
    const WATTAGE = {};
    const GROUPS = {};
    for (const [device, watt] of Object.entries(FULL_WATTAGE)) {
      if (!brokenSet.has(device)) {
        WATTAGE[device] = watt;
        const group = GROUP_MAP[device];
        if (!GROUPS[group]) GROUPS[group] = [];
        GROUPS[group].push(device);
      }
    }

    // Build on/off session map per group
    const groupDurations = {};
    for (const group of Object.keys(GROUPS)) {
      groupDurations[group] = [];
      const logs = applianceLogs.filter((l) => l.appliance === group);
      let onTime = null;
      for (const log of logs) {
        if (log.action === "on") {
          onTime = log.timestamp;
        } else if (log.action === "off" && onTime) {
          groupDurations[group].push([onTime, log.timestamp]);
          onTime = null;
        }
      }
      if (onTime) {
        groupDurations[group].push([onTime, new Date()]);
      }
    }

    // Compute energy per group
    const groupTotals = {};
    for (const [group, devices] of Object.entries(GROUPS)) {
      let groupKwh = 0;
      const periods = groupDurations[group];
      for (const [start, end] of periods) {
        for (const device of devices) {
          groupKwh += computeEnergy(WATTAGE[device], end - start);
        }
      }
      groupTotals[group] = Number(groupKwh.toFixed(2));
    }

    const knownSum = Object.values(groupTotals).reduce((a, b) => a + b, 0);
    const others = Number((totalKwh - knownSum).toFixed(2));

    const output = {
      ...groupTotals,
      "Lights and Others": Math.max(others, 0),
      Total: Number(totalKwh.toFixed(2)),
    };

    res.json(output);
  } catch (err) {
    console.error("Failed to compute grouped consumptions:", err);
    res.status(500).json({ error: "Failed to compute grouped consumptions." });
  }
};
