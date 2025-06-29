const axios = require("axios");

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
  if (!label) return null;
  const l = label.toLowerCase();
  if (l.includes("midea")) return "AC 1";
  if (l.includes("carrier")) return "AC 2";
  return null;
}

exports.getGroupedConsumptions = async (req, res) => {
  try {
    // Use correct endpoint
    const [powerRes, reportRes, applianceLogRes] = await Promise.all([
      axios.get("https://opticoolweb-backend.onrender.com/api/v1/powerconsumptions"),
      axios.get("https://opticoolweb-backend.onrender.com/api/v1/getreport"),
      axios.get("https://opticoolweb-backend.onrender.com/api/v1/appliances"),
    ]);

    // DEBUG: Ensure structure is valid
    if (!Array.isArray(powerRes.data)) {
      return res.status(500).json({ error: "Power data is invalid." });
    }

    const powerData = powerRes.data
      .filter((p) => new Date(p.timestamp) >= new Date("2025-03-21"))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const totalKwh =
      powerData.length > 1
        ? powerData[powerData.length - 1].consumption - powerData[0].consumption
        : 0;

    // Step 1: Process reports to exclude broken ACs
    const brokenSet = new Set();
    const reports = reportRes.data.reports || [];
    for (const report of reports) {
      const ac = getACName(report.appliance);
      if (ac && report.status === "inactive" && report.isResolved === "no") {
        brokenSet.add(ac);
      }
    }

    // Step 2: Parse appliance logs
    const applianceLogs = (Array.isArray(applianceLogRes.data) ? applianceLogRes.data : [])
      .filter((log) => new Date(log.timestamp) >= new Date("2025-06-28"))
      .map((log) => ({
        appliance: log.appliance,  // should be group name: "Fans", "ACs", etc.
        action: log.action,
        timestamp: new Date(log.timestamp),
      }));

    // Step 3: Build group-device mapping, exclude broken ACs
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

    // Step 4: Reconstruct ON-OFF durations for each group
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

    // Step 5: Compute energy usage per group
    const groupTotals = {};
    for (const [group, devices] of Object.entries(GROUPS)) {
      let groupKwh = 0;
      const durations = groupDurations[group] || [];
      for (const [start, end] of durations) {
        for (const device of devices) {
          groupKwh += computeEnergy(WATTAGE[device], end - start);
        }
      }
      groupTotals[group] = Number(groupKwh.toFixed(2));
    }

    // Step 6: Compute remainder
    const knownSum = Object.values(groupTotals).reduce((a, b) => a + b, 0);
    const others = Number((totalKwh - knownSum).toFixed(2));

    const output = {
      ...groupTotals,
      "Lights and Others": Math.max(others, 0),
      Total: Number(totalKwh.toFixed(2)),
    };

    res.json(output);
  } catch (err) {
    console.error("❌ Failed to compute grouped consumptions.");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error("Message:", err.message);
    }
    res.status(500).json({ error: "Failed to compute grouped consumptions." });
  }
};
