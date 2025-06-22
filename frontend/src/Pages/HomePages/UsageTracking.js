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
import { Bar } from "react-chartjs-2";
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

  // Fetch power data only
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

  const predDailyChart = {
    labels: predDaily.map(row => row.timestamp),
    datasets: [
      {
        label: "Predicted Daily Consumption (kWh)",
        data: predDaily.map(row => row.predicted),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      }
    ],
  };

  const predMonthlyChart = {
    labels: predMonthly.map(row => row.month),
    datasets: [
      {
        label: "Predicted Monthly Avg (kWh)",
        data: predMonthly.map(row => row.predicted_average),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
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
              <Typography variant="h6" gutterBottom>Daily Forecast</Typography>
              <Bar data={predDailyChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Monthly Forecast</Typography>
              <Bar data={predMonthlyChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: false } } }} />
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
