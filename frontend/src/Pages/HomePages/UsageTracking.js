import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./UsageTracking.css";

function sortByTimestamp(data) {
  return [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function groupByDayAverage(data) {
  const daily = {};
  data.forEach(row => {
    const date = new Date(row.timestamp);
    const key = date.toISOString().slice(0, 10);
    if (!daily[key]) daily[key] = [];
    daily[key].push(Number(row.consumption));
  });
  return Object.entries(daily)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, vals]) => {
      const label = new Date(key).toLocaleDateString("default", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      return { key, label, avg: Number(avg.toFixed(2)) };
    });
}

function groupByMonthAverage(data) {
  const monthly = {};
  data.forEach(row => {
    const date = new Date(row.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!monthly[key]) monthly[key] = [];
    monthly[key].push(Number(row.consumption));
  });
  return Object.entries(monthly)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, vals]) => {
      const [year, month] = key.split("-");
      const label = `${new Date(year, month - 1).toLocaleString("default", {
        month: "short"
      })} ${year}`;
      return { key, label, avg: Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) };
    });
}

const UsageTracking = () => {
  const [powerData, setPowerData] = useState([]);
  const [predictedData, setPredictedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily");

  // Fetch power data first, then fetch prediction
  useEffect(() => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API}/powerconsumptions`)
      .then(response => {
        const data = Array.isArray(response.data) ? response.data : [];
        setPowerData(data);

        // Preprocess for predictpower: flatten timestamp if needed
        const predictPayload = data.map(item => ({
          timestamp: typeof item.timestamp === 'object' && item.timestamp.$date
            ? item.timestamp.$date
            : item.timestamp,
          consumption: item.consumption
        }));

        if (predictPayload.length > 0) {
          axios.post(`${process.env.REACT_APP_FLASK_API}/predictpower`, predictPayload, {
            headers: { 'Content-Type': 'application/json' }
          })
            .then(response => {
              if (Array.isArray(response.data)) {
                setPredictedData(response.data);
              }
            })
            .catch(error => {
              setPredictedData([]);
              console.error('Error fetching prediction data:', error);
            })
            .finally(() => setLoading(false));
        } else {
          setPredictedData([]);
          setLoading(false);
        }
      })
      .catch(error => {
        setPowerData([]);
        setPredictedData([]);
        setLoading(false);
        console.error('Error fetching power consumption data:', error);
      });
  }, []);

  if (loading) return <CircularProgress />;

  let grouped = [];
  if (viewMode === "daily") {
    grouped = groupByDayAverage(powerData);
  } else {
    grouped = groupByMonthAverage(powerData);

    if (predictedData.length > 0) {
      const formattedPredictions = predictedData.map(entry => {
        // entry: {timestamp: "...", consumption: ...}
        const d = new Date(entry.timestamp || entry.month);
        const label = d.toLocaleString("default", {
          month: "short",
          year: "numeric"
        });
        return {
          label,
          avg: Number(entry.consumption ? entry.consumption.toFixed(2) : entry.prediction.toFixed(2)),
          predicted: true
        };
      });
      grouped = [...grouped, ...formattedPredictions];
    }
  }

  const realData = grouped.filter(item => !item.predicted);
  const predicted = grouped.filter(item => item.predicted);

  const chartData = {
    labels: grouped.map(row => row.label),
    datasets: [
      {
        label: "Actual Avg Power Consumption (kWh)",
        data: realData.map(row => row.avg),
        backgroundColor: "rgba(255, 159, 64, 0.8)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 2,
      },
      ...(predicted.length > 0
        ? [{
            label: "Predicted Avg Power Consumption (kWh)",
            data: [
              ...Array(realData.length).fill(null),
              ...predicted.map(row => row.avg)
            ],
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
          }]
        : [])
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
      x: {
        title: {
          display: true,
          text: viewMode === "daily" ? "Day" : "Month"
        }
      },
      y: {
        title: {
          display: true,
          text: "Power Consumption (kWh)"
        },
        beginAtZero: false,
      },
    },
  };

  return (
    <Container className="usage-tracking-container">
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
          {viewMode === "monthly" && predicted.length > 0 && (
            <Typography variant="body2" color="textSecondary" style={{ marginTop: "8px" }}>
              *Predicted values for the next 3 months based on historical data
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default UsageTracking;
