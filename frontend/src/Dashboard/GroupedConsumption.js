import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Typography, CircularProgress } from "@mui/material";
import moment from "moment";

const BASE_WATTAGE = {
  AC: {
    "AC 1": 1850,
    "AC 2": 1510,
  },
  Fan: {
    "Fan 1": 65,
    "Fan 2": 65,
    "Fan 3": 65,
    "Fan 4": 65,
  },
  Exhaust: {
    "Exhaust 1": 50,
    "Exhaust 2": 50,
  },
  Blower: {
    Blower: 200,
  },
};

const GROUPS = {
  ACs: "AC",
  Fans: "Fan",
  Exhausts: "Exhaust",
  Blowers: "Blower",
};

const computeEnergy = (watts, ms) => (watts * (ms / 3600000));

const getACName = (label) => {
  if (label.toLowerCase().includes("midea")) return "AC 1";
  if (label.toLowerCase().includes("carrier")) return "AC 2";
  return null;
};

const GroupedConsumption = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [powerRes, reportRes, logsRes] = await Promise.all([
          axios.get("https://opticoolweb-backend.onrender.com/api/v1/powerconsumptions"),
          axios.get("https://opticoolweb-backend.onrender.com/api/v1/getreport"),
          axios.get("https://opticoolweb-backend.onrender.com/api/v1/appliances"),
        ]);

        const power = Array.isArray(powerRes.data)
          ? powerRes.data.filter(p => new Date(p.timestamp) >= new Date("2025-05-01"))
          : [];
        const reports = Array.isArray(reportRes.data) ? reportRes.data : [];
        const logs = Array.isArray(logsRes.data?.data) ? logsRes.data.data : [];

        console.log("📦 Total Power Logs:", power.length);
        console.log("🧾 Reported Inactive Appliances:", reports);
        console.log("📜 Appliance Logs:", logs);
        console.log("🔍 Unique appliance names in logs:", [...new Set(logs.map(log => log.appliance))]);

        // Compute daily power consumption: first day = last reading, others = last(curr) - last(prev)
        const powerByDay = {};
        const powerByDayLast = {};
        for (const entry of power) {
          const day = moment(entry.timestamp).format("YYYY-MM-DD");
          powerByDayLast[day] = entry.consumption;
        }
        // Use the last reading of each day as the daily consumption (not the difference)
        Object.keys(powerByDayLast).forEach(day => {
          powerByDay[day] = powerByDayLast[day];
        });
        // Do NOT convert powerByDay values from Wh to kWh
        // Object.keys(powerByDay).forEach(day => {
        //   powerByDay[day] = powerByDay[day] / 1000;
        // });

        // Build a set of broken appliances by day (across unresolved periods)
        const brokenByDay = {};
        // Step 1: Build unresolved periods for each appliance
        const unresolvedPeriods = {};
        for (const report of reports) {
          const reportDay = moment(report.createdAt || report.timestamp || report.date).format("YYYY-MM-DD");
          // Find all matching appliance names in BASE_WATTAGE
          const matches = [];
          for (const group of Object.keys(BASE_WATTAGE)) {
            for (const name of Object.keys(BASE_WATTAGE[group])) {
              if (report.appliance.toLowerCase().includes(name.toLowerCase())) {
                matches.push(name);
              }
            }
          }
          for (const name of matches) {
            if (!unresolvedPeriods[name]) unresolvedPeriods[name] = [];
            if (report.status === "inactive" && report.isResolved === "no") {
              // Start of unresolved period
              unresolvedPeriods[name].push({ start: reportDay, end: null });
            } else if (report.status === "inactive" && report.isResolved === "yes") {
              // End of unresolved period (find last open period and close it)
              const periods = unresolvedPeriods[name];
              for (let i = periods.length - 1; i >= 0; i--) {
                if (periods[i].end === null) {
                  periods[i].end = reportDay;
                  break;
                }
              }
            }
          }
        }
        // Step 2: For each day, mark appliances as broken if within any unresolved period
        const allDays = Object.keys(powerByDay);
        for (const name of Object.keys(unresolvedPeriods)) {
          for (const period of unresolvedPeriods[name]) {
            if (!period.start) continue;
            const startIdx = allDays.indexOf(period.start);
            const endIdx = period.end ? allDays.indexOf(period.end) : allDays.length;
            for (let i = startIdx; i < (endIdx === -1 ? allDays.length : endIdx); i++) {
              const day = allDays[i];
              if (!brokenByDay[day]) brokenByDay[day] = new Set();
              brokenByDay[day].add(name);
            }
          }
        }

        // Calculate total group wattage (ignoring broken status, since handled per day)
        const WATTAGE = {};
        for (const [groupKey, deviceGroup] of Object.entries(BASE_WATTAGE)) {
          WATTAGE[groupKey] = Object.values(deviceGroup).reduce((sum, w) => sum + w, 0);
        }

        console.log("⚡ Active Device Group Wattage:", WATTAGE);

        const applianceLogs = logs.map(log => ({
          appliance: log.appliance,
          action: log.action,
          timestamp: new Date(log.timestamp),
        })).filter(log => log.timestamp >= new Date("2025-06-28"));

        applianceLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const sessionsByDate = {};

        // Only keep the grouped/fallback loop after powerByDay is computed
        for (const [groupLabel, groupKey] of Object.entries(GROUPS)) {
          const appliancesInGroup = Object.keys(BASE_WATTAGE[groupKey]);
          Object.keys(powerByDay).forEach(day => {
            // Use brokenByDay for this day
            const brokenSet = brokenByDay[day] || new Set();
            // Calculate log-based value
            let logBasedValue = 0;
            let hasLogsForDay = false;
            let groupLogs = [];
            for (const applianceName of appliancesInGroup) {
              if (brokenSet.has(applianceName)) continue;
              const logsForAppliance = applianceLogs.filter(log => {
                const logDay = moment(log.timestamp).format("YYYY-MM-DD");
                return logDay === day && log.appliance.toLowerCase().includes(applianceName.toLowerCase());
              });
              if (logsForAppliance.length > 0) hasLogsForDay = true;
              groupLogs.push({ applianceName, logsForAppliance });
            }
            // Calculate log-based value
            for (const { applianceName, logsForAppliance } of groupLogs) {
              let onTime = null;
              for (let i = 0; i < logsForAppliance.length; i++) {
                const log = logsForAppliance[i];
                if (log.action === "on") {
                  onTime = log.timestamp;
                } else if (log.action === "off" && onTime) {
                  const applianceWattage = BASE_WATTAGE[groupKey][applianceName];
                  const energy = computeEnergy(applianceWattage, log.timestamp - onTime); // Wh
                  logBasedValue += energy;
                  onTime = null;
                }
              }
              if (onTime) {
                const endOfDay = moment(day).endOf("day").toDate();
                const applianceWattage = BASE_WATTAGE[groupKey][applianceName];
                const energy = computeEnergy(applianceWattage, endOfDay - onTime); // Wh
                logBasedValue += energy;
              }
            }
            // Calculate fallback value
            let fallbackValue = 0;
            for (const applianceName of appliancesInGroup) {
              if (brokenSet.has(applianceName)) continue;
              const applianceWattage = BASE_WATTAGE[groupKey][applianceName];
              let ms = 0;
              if (groupLabel === "ACs" || groupLabel === "Fans") {
                ms = 8 * 3600000; // 8 hours
              } else if (groupLabel === "Exhausts" || groupLabel === "Blowers") {
                ms = 3 * 60 * 1000; // 3 minutes
              }
              fallbackValue += computeEnergy(applianceWattage, ms); // Wh
            }
            // Use the maximum of log-based and fallback value
            if (!sessionsByDate[day]) sessionsByDate[day] = {};
            if (!sessionsByDate[day][groupLabel]) sessionsByDate[day][groupLabel] = 0;
            sessionsByDate[day][groupLabel] = Math.max(logBasedValue, fallbackValue);
          });
        }

        const chartArray = Object.keys(powerByDay).map(date => {
          const breakdown = sessionsByDate[date] || {};
          // Round each group value to two decimal places
          let groupWh = Object.fromEntries(
            Object.keys(GROUPS).map(key => [key, breakdown[key] ? Number(breakdown[key].toFixed(2)) : 0])
          );
          let known = Object.values(groupWh).reduce((a, b) => a + b, 0);
          const total = Number(powerByDay[date].toFixed(2));
          let lightsAndOthers;

          // If known > total, scale down group values proportionally
          if (known > total && known > 0) {
            const scale = total / known;
            groupWh = Object.fromEntries(
              Object.entries(groupWh).map(([key, value]) => [key, Number((value * scale).toFixed(2))])
            );
            known = Object.values(groupWh).reduce((a, b) => a + b, 0);
            lightsAndOthers = Number((total - known).toFixed(2));
          } else {
            lightsAndOthers = Math.max(Number((total - known).toFixed(2)), 0);
          }

          console.log(`📅 ${date} → Known: ${known.toFixed(2)}Wh | Total: ${total.toFixed(2)}Wh | Others: ${lightsAndOthers}Wh`);

          return {
            date,
            ...groupWh,
            "Lights and Others": lightsAndOthers,
          };
        });

        setChartData(chartArray);
      } catch (err) {
        console.error("❌ Error computing daily grouped data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return (
    <>
      <Typography variant="h6" style={{ marginTop: 20, marginBottom: 10 }}>
        Daily Grouped Appliance Consumption (kWh)
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ACs" fill="#8884d8" />
            <Bar dataKey="Fans" fill="#82ca9d" />
            <Bar dataKey="Exhausts" fill="#ffc658" />
            <Bar dataKey="Blowers" fill="#ff8042" />
            <Bar dataKey="Lights and Others" fill="#a4a4a4" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export default GroupedConsumption;
