const axios = require("axios");
const moment = require("moment");

// Appliance wattage reference
const FULL_WATTAGE = {
  "AC 1": 1850,
  "AC 2": 1510,
  "Fan 1": 65,
  "Fan 2": 65,
  "Fan 3": 65,
  "Fan 4": 65,
  "Exhaust 1": 50,
  "Exhaust 2": 50,
  "Blower": 200
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
  "Blower": "Blowers"
};

function parseAction(action) {
  const lower = action.toLowerCase();
  if (lower.includes("turned on")) return "on";
  if (lower.includes("turned off")) return "off";
  return null;
}

function getDeviceName(action) {
  return Object.keys(FULL_WATTAGE).find((d) => action.toLowerCase().includes(d.toLowerCase()));
}

function computeEnergy(watts, msDuration) {
  const hours = msDuration / (1000 * 60 * 60);
  return (watts * hours) / 1000;
}

exports.getGroupedConsumptions = async (req, res) => {
  try {
    const filter = req.query.filter;
    let startDate;
    if (filter === "daily") {
      startDate = moment().startOf("day");
    } else if (filter === "monthly") {
      startDate = moment().startOf("month");
    } else {
      startDate = moment("2025-03-21");
    }

    const [powerRes, logsRes, reportRes] = await Promise.all([
      axios.get("https://opticoolweb-backend.onrender.com/api/v1/powerconsumptions"),
      axios.get("https://opticoolweb-backend.onrender.com/api/v1/activity-log"),
      axios.get("https://opticoolweb-backend.onrender.com/api/v1/getreport")
    ]);

    const reportData = reportRes.data;
    const brokenAppliances = new Set(reportData.map(r => r.appliance));

    const WATTAGE = {};
    const GROUPS = {};
    for (const [device, watt] of Object.entries(FULL_WATTAGE)) {
      if (!brokenAppliances.has(device.split(" ")[0])) {
        WATTAGE[device] = watt;
        const group = GROUP_MAP[device];
        if (!GROUPS[group]) GROUPS[group] = [];
        GROUPS[group].push(device);
      }
    }

    const powerData = powerRes.data
      .filter(p => new Date(p.timestamp) >= startDate.toDate())
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const totalKwh = powerData.length > 1
      ? powerData[powerData.length - 1].consumption - powerData[0].consumption
      : 0;

    const logs = logsRes.data
      .filter(log => new Date(log.timestamp) >= startDate.toDate())
      .map(log => ({
        time: new Date(log.timestamp),
        type: parseAction(log.action),
        device: getDeviceName(log.action)
      }))
      .filter(e => e.type && e.device && WATTAGE[e.device]);

    const activeDurations = {};
    for (const device of Object.keys(WATTAGE)) {
      activeDurations[device] = [];
    }

    const deviceState = {};
    logs.forEach(log => {
      const { device, type, time } = log;
      if (!deviceState[device] && type === "on") {
        deviceState[device] = time;
      } else if (deviceState[device] && type === "off") {
        activeDurations[device].push([deviceState[device], time]);
        deviceState[device] = null;
      }
    });

    for (const device in deviceState) {
      if (deviceState[device]) {
        activeDurations[device].push([deviceState[device], new Date()]);
      }
    }

    const groupTotals = {};
    for (const [group, devices] of Object.entries(GROUPS)) {
      let groupKwh = 0;
      for (const device of devices) {
        const watt = WATTAGE[device];
        const durations = activeDurations[device];
        durations.forEach(([start, end]) => {
          groupKwh += computeEnergy(watt, end - start);
        });
      }
      groupTotals[group] = Number(groupKwh.toFixed(2));
    }

    const others = Number((
      totalKwh - Object.values(groupTotals).reduce((a, b) => a + b, 0)
    ).toFixed(2));

    const output = {
      ...groupTotals,
      "Lights and Others": Math.max(others, 0),
      Total: Number(totalKwh.toFixed(2))
    };

    res.json(output);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compute grouped consumptions." });
  }
};