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

// Group data by month and get average consumption per month
function groupByMonth(data) {
  const grouped = {};
  data.forEach(row => {
    const d = new Date(row.timestamp);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row.consumption);
  });

  // Sort months
  const sorted = Object.entries(grouped).sort(([a], [b]) => {
    const [aYear, aMonth] = a.split('-').map(Number);
    const [bYear, bMonth] = b.split('-').map(Number);
    return aYear !== bYear ? aYear - bYear : aMonth - bMonth;
  });

  return sorted.map(([key, vals]) => {
    const [year, monthIdx] = key.split("-");
    const date = new Date(year, monthIdx);
    const label = date.toLocaleString("default", { month: "short", year: "numeric" });
    return {
      label,
      value: vals.reduce((a, b) => a + b, 0) / vals.length,
      timestamp: date
    };
  });
}

function UsageTracking() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predictionPoints, setPredictionPoints] = useState([]);

useEffect(() => {
  axios.get(`${process.env.REACT_APP_API}/getpowerconsumption`)
    .then(res => {
      const sorted = sortByTimestamp(res.data);
      const grouped = groupByMonth(sorted);
      setMonthlyData(grouped);

      // 🔗 Call Flask ML endpoint
      return axios.post(`${process.env.REACT_APP_API}/predictpower`, sorted)
        .then(predRes => {
          const preds = predRes.data.map(p => {
            const d = new Date(p.timestamp);
            return {
              label: d.toLocaleString("default", { month: "short", year: "numeric" }),
              value: p.consumption,
              timestamp: d
            };
          });
          setPredictionPoints(preds);
        });
    })
    .catch(err => {
      console.error("Error:", err);
    })
    .finally(() => setLoading(false));
}, []);


  if (loading) return <CircularProgress />;

  // Combine actual and prediction for chart
  const allData = [...monthlyData, ...predictionPoints];

  const chartData = {
    labels: allData.map(row => row.label),
    datasets: [
      {
        label: "Monthly Avg Power Consumption",
        data: monthlyData.map(row => row.value),
        fill: false,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.1,
      },
      {
        label: "Prediction (ML Monthly to July 2025)",
        data: [
          ...Array(monthlyData.length - 1).fill(null),
          monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].value : null,
          ...predictionPoints.map(p => p.value)
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
      title: { display: true, text: "Power Consumption (Monthly Avg & Prediction)" },
    },
    scales: {
      x: { title: { display: true, text: "Month" } },
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