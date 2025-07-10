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
  const [customHardware, setCustomHardware] = useState([]);

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

        // Fetch custom hardware
        const customHardwareRes = await axios.get("/api/v1/add-hardware");
        const customHardwareList = Array.isArray(customHardwareRes.data) ? customHardwareRes.data : [];
        setCustomHardware(customHardwareList);
        // Build dynamic BASE_WATTAGE
        const dynamicBaseWattage = JSON.parse(JSON.stringify(BASE_WATTAGE));
        for (const hw of customHardwareList) {
          if (hw.Type && dynamicBaseWattage[hw.Type]) {
            // Add to group if matches
            dynamicBaseWattage[hw.Type][hw.Appliance] = hw.Watts * (hw.Quantity || 1);
          } else {
            // Add to Lights and Others
            if (!dynamicBaseWattage.Lights) dynamicBaseWattage.Lights = {};
            dynamicBaseWattage.Lights[hw.Appliance] = hw.Watts * (hw.Quantity || 1);
          }
        }

        // Calculate total group wattage (ignoring broken status, since handled per day)
        const WATTAGE = {};
        for (const [groupKey, deviceGroup] of Object.entries(dynamicBaseWattage)) {
          WATTAGE[groupKey] = Object.values(deviceGroup).reduce((sum, w) => sum + w, 0);
        }

        // Build chart data (simple version: just show total per group per day)
        const chartArray = Object.keys(powerByDay).map(date => {
          return {
            date,
            Total: Number(powerByDay[date].toFixed(2)),
          };
        });

        setChartData(chartArray);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error("❌ Error computing daily grouped data:", err);
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
            <Bar dataKey="Total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export default GroupedConsumption;
