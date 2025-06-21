import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, CardContent, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./UsageTracking.css"; // Adjust the path as needed

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
    daily[key].push(Number(row.powerConsumption));
  });
  return Object.entries(daily)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, vals]) => {
      const label = new Date(key).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
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
    monthly[key].push(Number(row.powerConsumption));
  });
  return Object.entries(monthly)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, vals]) => {
      const [year, month] = key.split("-");
      const label = `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`;
      return { key, label, avg: Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) };
    });
}

const PowerConsumptionUsage = () => {
  const [powerData, setPowerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily"); // "daily" or "monthly"

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API}/powerconsumptions`)
      .then(response => {
        setPowerData(Array.isArray(response.data) ? sortByTimestamp(response.data) : []);
      })
      .catch(error => console.error('Error fetching power consumption data:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  const grouped =
    viewMode === "daily"
      ? groupByDayAverage(powerData)
      : groupByMonthAverage(powerData);

  const labels = grouped.map(row => row.label);
  const chartData = {
    labels,
    datasets: [
      {
        label:
          viewMode === "daily"
            ? "Daily Avg Power Consumption (kWh)"
            : "Monthly Avg Power Consumption (kWh)",
        data: grouped.map(row => row.avg),
        backgroundColor: "rgba(255, 159, 64, 0.8)",
        borderColor: "rgba(255, 159, 64, 1)",
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
            ? "Daily Average Power Consumption"
            : "Monthly Average Power Consumption",
      },
    },
    scales: {
      x: { title: { display: true, text: viewMode === "daily" ? "Day" : "Month" } },
      y: {
        title: { display: true, text: "Power Consumption (kWh)" },
        beginAtZero: false,
      },
    },
  };

  return (
    <Container className="temperature-usage-container">
      <Card>
        <CardContent>
          <Typography className="title" gutterBottom>
            {viewMode === "daily"
              ? "Daily Average Power Consumption"
              : "Monthly Average Power Consumption"}
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
          <div className="chart-container tempusage-chart-scroll">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PowerConsumptionUsage;
