import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, CardContent, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./HumidityUsage.css";

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
    daily[key].push(Number(row.humidity));
  });
  return Object.entries(daily)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, hums]) => {
      const label = new Date(key).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
      const avg = hums.reduce((a, b) => a + b, 0) / hums.length;
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
    monthly[key].push(Number(row.humidity));
  });
  return Object.entries(monthly)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, hums]) => {
      const [year, month] = key.split("-");
      const label = `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`;
      return { key, label, avg: Number((hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(2)) };
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

const HumidityUsage = () => {
  const [insideHumidity, setInsideHumidity] = useState([]);
  const [outsideHumidity, setOutsideHumidity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily"); // "daily" or "monthly"

  useEffect(() => {
    const fetchHumidities = async () => {
      try {
        // Fetch insidehumidities
        const insidePromise = axios.get(`${process.env.REACT_APP_API}/insidehumidities`);
        // Fetch outsidehumidities
        const outsidePromise = axios.get(`${process.env.REACT_APP_API}/outsidehumidities`);
        // Fetch gethumidity
        const getHumidityPromise = axios.get(`${process.env.REACT_APP_API}/gethumidity`);

        Promise.all([insidePromise, outsidePromise, getHumidityPromise])
          .then(([insideRes, outsideRes, getHumidityRes]) => {
            const insideData = Array.isArray(insideRes.data) ? insideRes.data : [];
            const outsideData = Array.isArray(outsideRes.data) ? outsideRes.data : [];
            const getHumidityData = Array.isArray(getHumidityRes.data) ? getHumidityRes.data : [];

            // Split getHumidityData into inside/outside by humidity value
            const sorted = [...getHumidityData].sort((a, b) => a.humidity - b.humidity);
            const mid = Math.floor(sorted.length / 2);
            const getHumidityInside = sorted.slice(0, mid);
            const getHumidityOutside = sorted.slice(mid);

            // Merge
            setInsideHumidity([...insideData, ...getHumidityInside]);
            setOutsideHumidity([...outsideData, ...getHumidityOutside]);
          })
          .catch(error => console.error('Error fetching humidity data:', error));
      } catch (err) {
        console.error("Error fetching humidity data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHumidities();
  }, []);

  if (loading) return <CircularProgress />;

  // Group data based on view mode
  const groupedOutside =
    viewMode === "daily"
      ? groupByDayAverage(outsideHumidity)
      : groupByMonthAverage(outsideHumidity);

  const groupedInside =
    viewMode === "daily"
      ? groupByDayAverage(insideHumidity)
      : groupByMonthAverage(insideHumidity);

  // Align by key (date or month)
  const aligned = alignGroupedData(groupedOutside, groupedInside);

  const labels = aligned.map(row => row.label);

  const chartData = {
    labels,
    datasets: [
      {
        label:
          viewMode === "daily"
            ? "Daily Avg Outside Humidity (%)"
            : "Monthly Avg Outside Humidity (%)",
        data: aligned.map(row => row.avg1),
        backgroundColor: "rgba(255, 193, 7, 0.8)",
        borderColor: "rgba(255, 193, 7, 1)",
        borderWidth: 2,
      },
      {
        label:
          viewMode === "daily"
            ? "Daily Avg Inside Humidity (%)"
            : "Monthly Avg Inside Humidity (%)",
        data: aligned.map(row => row.avg2),
        backgroundColor: "rgba(33, 150, 243, 0.8)",
        borderColor: "rgba(33, 150, 243, 1)",
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
            ? "Daily Average Inside & Outside Humidity"
            : "Monthly Average Inside & Outside Humidity",
      },
    },
    scales: {
      x: { title: { display: true, text: viewMode === "daily" ? "Day" : "Month" } },
      y: {
        title: { display: true, text: "Humidity (%)" },
        beginAtZero: true,
      },
    },
  };

  return (
    <Container className="humidity-usage-container">
      <Card>
        <CardContent>
          <Typography className="title" gutterBottom>
            {viewMode === "daily"
              ? "Daily Average Inside & Outside Humidity"
              : "Monthly Average Inside & Outside Humidity"}
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

export default HumidityUsage;