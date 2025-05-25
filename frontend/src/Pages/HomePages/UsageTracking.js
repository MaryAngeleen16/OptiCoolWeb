import { useEffect, useState } from 'react'
import {
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

// Helper function to sort data by timestamp ascending
function sortByTimestamp(data) {
  return [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Simple prediction: linear extrapolation based on the last two points
function getPredictionPoints(sortedData, numPredictions = 5) {
  if (sortedData.length < 2) return [];
  const last = sortedData[sortedData.length - 1];
  const prev = sortedData[sortedData.length - 2];
  const lastTime = new Date(last.timestamp).getTime();
  const prevTime = new Date(prev.timestamp).getTime();
  const interval = lastTime - prevTime || 24 * 60 * 60 * 1000; // default 1 day if same
  const delta = last.consumption - prev.consumption;

  const predictions = [];
  let nextTime = lastTime;
  let nextValue = last.consumption;
  for (let i = 1; i <= numPredictions; i++) {
    nextTime += interval;
    nextValue += delta;
    predictions.push({
      timestamp: new Date(nextTime).toISOString(),
      consumption: nextValue,
    });
  }
  return predictions;
}

function UsageTracking() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API}/getpowerconsumption`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  // Sort data by timestamp (oldest to latest)
  const sortedData = sortByTimestamp(data);

  // Generate prediction points
  const predictionPoints = getPredictionPoints(sortedData, 5);

  // Combine actual and prediction for chart
  const allData = [...sortedData, ...predictionPoints];

  const chartData = {
    labels: allData.map(row => new Date(row.timestamp).toLocaleString()),
    datasets: [
      {
        label: "Power Consumption",
        data: sortedData.map(row => row.consumption),
        fill: false,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.1,
      },
      {
        label: "Prediction",
        data: [
          ...Array(sortedData.length - 1).fill(null),
          sortedData.length > 0 ? sortedData[sortedData.length - 1].consumption : null,
          ...predictionPoints.map(p => p.consumption)
        ],
        fill: false,
        borderColor: "yellow",
        backgroundColor: "yellow",
        borderDash: [5, 5],
        pointRadius: 3,
        tension: 0.1,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Power Consumption (Raw Data & Prediction)" },
    },
    scales: {
      x: { title: { display: true, text: "Timestamp" } },
      y: { title: { display: true, text: "Consumption" }, beginAtZero: true },
    },
  };

  return (
    <Container style={{ marginTop: 40 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Power Consumption Data & Prediction
          </Typography>
          <Line data={chartData} options={chartOptions} />
        </CardContent>
      </Card>
    </Container>
  )
}

export default UsageTracking