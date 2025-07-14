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
  const predMonthly = prediction?.monthly_forecast || [];

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

  // 1. Get all actual and predicted months
  const actualMonths = actualMonthly.map(row => row.label);
  const predictedMonths = predMonthly.map(row => row.month);

  // 2. Merge, remove duplicates, and sort chronologically
  const allMonthlyLabels = Array.from(new Set([...actualMonths, ...predictedMonths]))
    .sort((a, b) => {
      // Parse "Jun 2025" to Date for sorting
      const parse = str => {
        const [mon, year] = str.split(' ');
        return new Date(`${mon} 1, ${year}`);
      };
      return parse(a) - parse(b);
    });

  const actualMonthlyData = allMonthlyLabels.map(label => {
    const found = actualMonthly.find(row => row.label === label);
    return found ? Number(found.avg.toFixed(2)) : null;
  });
  const predictedMonthlyData = allMonthlyLabels.map(label => {
    const found = predMonthly.find(row => row.month === label);
    return found ? Number(found.predicted_average) : null;
  });

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
    <Container className="usage-tracking-container" maxWidth="md" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh"
    }}>

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
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <div style={{ maxWidth: 600, width: '100%' }}>
                <Typography variant="h6" gutterBottom>Monthly Forecast (Actual vs Predicted)</Typography>
                <Line data={predMonthlyChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
              </div>
            </div>
          ) : (
            <Typography color="error">Failed to load prediction.</Typography>
          )}
        </DialogContent>
      </Dialog>

      <Card style={{ width: "100%", maxWidth: 800 }}>
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
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              minHeight: 350,
            }}
            className="chart-container tempusage-chart-scroll"
          >
            <Bar data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UsageTracking;
