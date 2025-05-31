import { useEffect, useState } from 'react';
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

function sortByTimestamp(data) {
  return [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function groupByMonth(data) {
  const grouped = {};
  data.forEach(row => {
    const d = new Date(row.timestamp);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row.consumption);
  });

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

  const combined = [...monthlyData, ...predictionPoints];
  const uniqueLabels = Array.from(
    new Set(combined.map(item => item.label))
  );

  const actualMap = Object.fromEntries(monthlyData.map(p => [p.label, p.value]));
  const predictionMap = Object.fromEntries(predictionPoints.map(p => [p.label, p.value]));

  const actualData = uniqueLabels.map(label => actualMap[label] ?? null);
  const predictedData = uniqueLabels.map(label => predictionMap[label] ?? null);

  const chartData = {
    labels: uniqueLabels,
    datasets: [
      {
        label: "Monthly Avg Power Consumption",
        data: actualData,
        fill: false,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.1,
      },
      {
        label: "Prediction (Next 6 Months)",
        data: predictedData,
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
      title: { display: true, text: "Power Consumption Forecast" },
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
            Power Consumption Data & 6-Month Forecast
          </Typography>
          <Line data={chartData} options={chartOptions} />
        </CardContent>
      </Card>
    </Container>
  );
}

export default UsageTracking;
