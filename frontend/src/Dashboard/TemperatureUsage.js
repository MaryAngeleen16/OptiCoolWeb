import { useEffect, useState } from "react";
import { Container, Card, CardContent, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./StylesUsage.css";

function sortByTimestamp(data) {
  return [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Helper to group by day and calculate average
function groupByDayAverage(data) {
  const daily = {};
  data.forEach(row => {
    const date = new Date(row.timestamp);
    const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!daily[key]) daily[key] = [];
    daily[key].push(Number(row.temperature));
  });
  return Object.entries(daily)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, temps]) => {
      const label = new Date(key).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
      const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
      return { key, label, avg: Number(avg.toFixed(2)) };
    });
}

// Helper to group by month and calculate average
function groupByMonthAverage(data) {
  const monthly = {};
  data.forEach(row => {
    const date = new Date(row.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`; // e.g. "2025-6"
    if (!monthly[key]) monthly[key] = [];
    monthly[key].push(Number(row.temperature));
  });
  return Object.entries(monthly)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, temps]) => {
      const [year, month] = key.split("-");
      const label = `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`;
      return { key, label, avg: Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2)) };
    });
}

// Helper to align two grouped arrays by key
function alignGroupedData(grouped1, grouped2) {
  const allKeys = Array.from(new Set([...grouped1.map(d => d.key), ...grouped2.map(d => d.key)])).sort();
  const map1 = Object.fromEntries(grouped1.map(d => [d.key, d]));
  const map2 = Object.fromEntries(grouped2.map(d => [d.key, d]));
  return allKeys.map(key => ({
    key,
    label: map1[key]?.label || map2[key]?.label || key,
    avg1: map1[key]?.avg ?? null,
    avg2: map2[key]?.avg ?? null,
  }));
}

const TemperatureUsage = () => {
  const [outsideData, setOutsideData] = useState([]);
  const [insideData, setInsideData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily"); // "daily" or "monthly"

  useEffect(() => {
    const fetchTemps = async () => {
      try {
        const [outsideRes, insideRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API}/outsidetemperatures`),
          axios.get(`${process.env.REACT_APP_API}/insidetemperatures`)
        ]);
        setOutsideData(sortByTimestamp(outsideRes.data));
        setInsideData(sortByTimestamp(insideRes.data));
      } catch (err) {
        console.error("Error fetching temperature data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemps();
  }, []);

  if (loading) return <CircularProgress />;

  // Group data based on view mode
  const groupedOutside =
    viewMode === "daily"
      ? groupByDayAverage(outsideData)
      : groupByMonthAverage(outsideData);

  const groupedInside =
    viewMode === "daily"
      ? groupByDayAverage(insideData)
      : groupByMonthAverage(insideData);

  // Align by key (date or month)
  const aligned = alignGroupedData(groupedOutside, groupedInside);

  const labels = aligned.map(row => row.label);

  const chartData = {
    labels,
    datasets: [
      {
        label:
          viewMode === "daily"
            ? "Daily Avg Outside Temperature (°C)"
            : "Monthly Avg Outside Temperature (°C)",
        data: aligned.map(row => row.avg1),
        backgroundColor: "rgba(255, 99, 132, 0.8)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
      {
        label:
          viewMode === "daily"
            ? "Daily Avg Inside Temperature (°C)"
            : "Monthly Avg Inside Temperature (°C)",
        data: aligned.map(row => row.avg2),
        backgroundColor: "rgba(0, 123, 255, 0.8)",
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: {
        display: true,
        text:
          viewMode === "daily"
            ? "Daily Average Inside & Outside Temperature"
            : "Monthly Average Inside & Outside Temperature",
      },
    },
    scales: {
      x: { title: { display: true, text: viewMode === "daily" ? "Day" : "Month" } },
      y: {
        title: { display: true, text: "Temperature (°C)" },
        beginAtZero: true,
      },
    },
  };

  return (
    <Container style={{ marginTop: 40 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {viewMode === "daily"
              ? "Daily Average Inside & Outside Temperature"
              : "Monthly Average Inside & Outside Temperature"}
          </Typography>
          <FormControl className="tempusage-dropdown" size="small">
            <InputLabel id="view-mode-label">View</InputLabel>
            <Select
              labelId="view-mode-label"
              value={viewMode}
              label="View"
              onChange={e => setViewMode(e.target.value)}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
          <div className="tempusage-chart-scroll">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TemperatureUsage;