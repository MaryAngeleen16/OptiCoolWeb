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
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from "@mui/material";
import { Bar, Line } from "react-chartjs-2";
import CloseIcon from '@mui/icons-material/Close';
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
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily");

  // Prediction dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API}/powerconsumptions`)
      .then(response => {
        const data = Array.isArray(response.data) ? response.data : [];
        setPowerData(data);
        setLoading(false);
      })
      .catch(error => {
        setPowerData([]);
        setLoading(false);
        console.error('Error fetching power consumption data:', error);
      });
  }, []);

  // Fetch prediction when dialog opens
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setPredictionLoading(true);
    axios.get('https://opticoolpredict.onrender.com/forecast')
      .then(res => {
        setPrediction(res.data);
        setPredictionLoading(false);
      })
      .catch(() => {
        setPrediction(null);
        setPredictionLoading(false);
      });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPrediction(null);
  };

  if (loading) return <CircularProgress />;

  let grouped = [];
  if (viewMode === "daily") {
    grouped = groupByDayAverage(powerData);
  } else {
    grouped = groupByMonthAverage(powerData);
  }

  const chartData = {
    labels: grouped.map(row => row.label),
    datasets: [
      {
        label: "Avg Power Consumption (kWh)",
        data: grouped.map(row => row.avg),
        backgroundColor: "rgba(255, 159, 64, 0.8)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 2,
      }
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

  // Prediction chart data
  const predDaily = prediction?.daily_forecast || [];
  const predMonthly = prediction?.monthly_forecast || [];

  // Prepare actual daily data (align with prediction labels)
  const actualDailyMap = {};
  powerData.forEach(row => {
    const date = new Date(row.timestamp).toISOString().slice(0, 10);
    if (!actualDailyMap[date]) actualDailyMap[date] = [];
    actualDailyMap[date].push(Number(row.consumption));
  });
  const actualDaily = Object.entries(actualDailyMap).map(([key, vals]) => ({
    key,
    avg: vals.reduce((a, b) => a + b, 0) / vals.length
  }));

  // For daily chart, show only today + next 3 days (excluding Sundays)
  function getNextNDates(n) {
    const dates = [];
    let d = new Date();
    while (dates.length < n + 1) { // today + n days
      if (d.getDay() !== 0) { // 0 = Sunday
        dates.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }
    return dates;
  }
  const next3Days = getNextNDates(3).map(d => d.toISOString().slice(0, 10));

  const allDailyLabels = next3Days;

  const actualDailyData = allDailyLabels.map(label => {
    const found = actualDaily.find(row => row.key === label);
    return found ? Number(found.avg.toFixed(2)) : null;
  });
  const predictedDailyData = allDailyLabels.map(label => {
    const found = predDaily.find(row => row.timestamp === label);
    return found ? Number(found.predicted) : null;
  });

  // Prepare actual monthly data (align with prediction labels)
  const actualMonthlyMap = {};
  powerData.forEach(row => {
    const date = new Date(row.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!actualMonthlyMap[key]) actualMonthlyMap[key] = [];
    actualMonthlyMap[key].push(Number(row.consumption));
  });
  const actualMonthly = Object.entries(actualMonthlyMap).map(([key, vals]) => {
    const [year, month] = key.split("-");
    const label = `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`;
    return { key, label, avg: vals.reduce((a, b) => a + b, 0) / vals.length };
  });

  const allMonthlyLabels = Array.from(new Set([
    ...predMonthly.map(row => {
      // Format prediction month to match actual label (e.g., "Jul 2025")
      const [year, month] = row.month.split("-");
      return `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`;
    }),
    ...actualMonthly.map(row => row.label)
  ]));

  // Map predicted data to the correct label
  const predictedMonthlyData = allMonthlyLabels.map(label => {
    // Find the prediction whose formatted label matches
    const found = predMonthly.find(row => {
      const [year, month] = row.month.split("-");
      const predLabel = `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`;
      return predLabel === label;
    });
    return found ? Number(found.predicted_average) : null;
  });

  // Map actual data to the correct label for monthly chart
  const actualMonthlyData = allMonthlyLabels.map(label => {
    const found = actualMonthly.find(row => row.label === label);
    return found ? Number(found.avg.toFixed(2)) : null;
  });

  const predDailyChart = {
    labels: allDailyLabels,
    datasets: [
      {
        label: "Actual Daily Consumption (kWh)",
        data: actualDailyData,
        fill: false,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.3,
        pointRadius: 2,
      },
      {
        label: "Predicted Daily Consumption (kWh)",
        data: predictedDailyData,
        fill: false,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 2,
      }
    ],
  };

  const predMonthlyChart = {
    labels: allMonthlyLabels,
    datasets: [
      {
        label: "Actual Monthly Avg (kWh)",
        data: actualMonthlyData,
        fill: false,
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.5)",
        tension: 0.3,
        pointRadius: 2,
      },
      {
        label: "Predicted Monthly Avg (kWh)",
        data: predictedMonthlyData,
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 2,
      }
    ],
  };

  return (
    <Container className="usage-tracking-container">


      {/* Prediction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Power Consumption Prediction
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {predictionLoading ? (
            <CircularProgress />
          ) : prediction ? (
            <>
              <Typography variant="h6" gutterBottom>Daily Forecast (Actual vs Predicted)</Typography>
              <Line data={predDailyChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Monthly Forecast (Actual vs Predicted)</Typography>
              <Line data={predMonthlyChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
            </>
          ) : (
            <Typography color="error">Failed to load prediction.</Typography>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent>
          <Typography className="title" gutterBottom>
            {viewMode === "daily"
              ? "Daily Average Power Consumption"
              : "Monthly Average Power Consumption"}
          </Typography>
          {/* Flex row for dropdown and prediction button */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenDialog}
            >
              Show Prediction
            </Button>
          </div>
          <div className="chart-container tempusage-chart-scroll">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UsageTracking;
