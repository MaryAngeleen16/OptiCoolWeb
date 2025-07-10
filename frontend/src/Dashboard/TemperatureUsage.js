import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, CardContent, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./StylesUsage.css";

function sortByTimestamp(data) {
  return [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function groupByDayAverage(data) {
  const daily = {};
  data.forEach(row => {
    const date = new Date(row.timestamp);
    const key = date.toISOString().slice(0, 10);
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

function groupByMonthAverage(data) {
  const monthly = {};
  data.forEach(row => {
    const date = new Date(row.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
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
  const [insideTemperature, setInsideTemperature] = useState([]);
  const [outsideTemperature, setOutsideTemperature] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily");

  useEffect(() => {
    const fetchTemperatures = async () => {
      try {
        const insidePromise = axios.get(`${process.env.REACT_APP_API}/insidetemperatures`);
        const outsidePromise = axios.get(`${process.env.REACT_APP_API}/outsidetemperatures`);
        const getTemperaturePromise = axios.get(`${process.env.REACT_APP_API}/gettemperature`);

        Promise.all([insidePromise, outsidePromise, getTemperaturePromise])
          .then(([insideRes, outsideRes, getTemperatureRes]) => {
            const insideData = Array.isArray(insideRes.data) ? insideRes.data : [];
            const outsideData = Array.isArray(outsideRes.data) ? outsideRes.data : [];
            const getTemperatureData = Array.isArray(getTemperatureRes.data) ? getTemperatureRes.data : [];

            const sorted = [...getTemperatureData].sort((a, b) => a.temperature - b.temperature);
            const mid = Math.floor(sorted.length / 2);
            const getTemperatureInside = sorted.slice(0, mid);
            const getTemperatureOutside = sorted.slice(mid);

            setInsideTemperature([...insideData, ...getTemperatureInside]);
            setOutsideTemperature([...outsideData, ...getTemperatureOutside]);
            setLoading(false);
          })
          .catch(error => {
            setLoading(false);
            console.error('Error fetching temperature data:', error);
          });
      } catch (err) {
        setLoading(false);
        console.error("Error fetching temperature data:", err);
      }
    };
    fetchTemperatures();
  }, []);

  if (loading) return <CircularProgress />;

  const groupedOutside =
    viewMode === "daily"
      ? groupByDayAverage(outsideTemperature)
      : groupByMonthAverage(outsideTemperature);

  const groupedInside =
    viewMode === "daily"
      ? groupByDayAverage(insideTemperature)
      : groupByMonthAverage(insideTemperature);

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
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
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
          <div className="chart-container tempusage-chart-scroll">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TemperatureUsage;