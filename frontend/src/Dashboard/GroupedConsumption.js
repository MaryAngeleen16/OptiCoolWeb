import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

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

const GroupedConsumption = () => {
  const [grouped, setGrouped] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("https://opticoolweb-backend.onrender.com/api/v1/grouped-raw");
        const { power, reports, logs } = res.data;

        const powerData = power
          .filter((p) => new Date(p.timestamp) >= new Date("2025-03-21"))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const totalKwh =
          powerData.length > 1
            ? powerData[powerData.length - 1].consumption - powerData[0].consumption
            : 0;

        const brokenSet = new Set();
        for (const report of reports) {
          const ac = getACName(report.appliance);
          if (ac && report.status === "inactive" && report.isResolved === "no") {
            brokenSet.add(ac);
          }
        }

        const applianceLogs = logs
          .filter((log) => new Date(log.timestamp) >= new Date("2025-06-28"))
          .map((log) => ({
            appliance: log.appliance,
            action: log.action,
            timestamp: new Date(log.timestamp),
          }));

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

        setGrouped(output);
      } catch (err) {
        console.error("Error computing grouped data:", err);
        setGrouped(null);
      }
    };

    fetch();
  }, []);

  return grouped;
};

export default GroupedConsumption;