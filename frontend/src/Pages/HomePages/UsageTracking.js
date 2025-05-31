import { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

function sortByTimestamp(data) {
  return [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function groupByMonth(data) {
  const grouped = {};
  data.forEach((row) => {
    const d = new Date(row.timestamp);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row.consumption);
  });

  const sorted = Object.entries(grouped).sort(([a], [b]) => {
    const [aYear, aMonth] = a.split("-").map(Number);
    const [bYear, bMonth] = b.split("-").map(Number);
    return aYear !== bYear ? aYear - bYear : aMonth - bMonth;
  });

  return sorted.map(([key, vals]) => {
    const [year, monthIdx] = key.split("-");
    const date = new Date(year, monthIdx);
    const label = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    return {
      label,
      value: vals.reduce((a, b) => a + b, 0) / vals.length,
      timestamp: date,
    };
  });
}

function UsageTracking() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predictionPoints, setPredictionPoints] = useState([]);

  useEffect(() => {
    const dummyData = [];
    const startYear = 2024;
    const startMonth = 9; // October (0-based)
    const endMonth = 4; // May (0-based, in 2025)

    for (let m = startMonth; m <= 11; m++) {
      const date = new Date(startYear, m, 1);
      const consumption = 80 + Math.random() * 40;
      dummyData.push({
        timestamp: date.toISOString(),
        consumption,
      });
    }

    for (let m = 0; m <= endMonth; m++) {
      const date = new Date(startYear + 1, m, 1);
      const consumption = 80 + Math.random() * 40;
      dummyData.push({
        timestamp: date.toISOString(),
        consumption,
      });
    }

    const sorted = sortByTimestamp(dummyData);
    const grouped = groupByMonth(sorted);
    setMonthlyData(grouped);

    axios
      .post(`${process.env.REACT_APP_FLASK_API}/predictpower`, sorted)
      .then((predRes) => {
        const preds = predRes.data.map((p) => {
          const d = new Date(p.timestamp);
          return {
            label: d.toLocaleString("default", {
              month: "short",
              year: "numeric",
            }),
            value: p.consumption,
            yhat_lower: p.yhat_lower,
            yhat_upper: p.yhat_upper,
            timestamp: d,
          };
        });
        setPredictionPoints(preds);
      })
      .catch((err) => {
        console.error("Error fetching prediction:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  const combined = [...monthlyData, ...predictionPoints];
  const uniqueLabels = Array.from(new Set(combined.map((item) => item.label)));

  const actualMap = Object.fromEntries(
    monthlyData.map((p) => [p.label, p.value])
  );
  const predictionMap = Object.fromEntries(
    predictionPoints.map((p) => [p.label, p.value])
  );
  const predictionLowerMap = Object.fromEntries(
    predictionPoints.map((p) => [p.label, p.yhat_lower])
  );
  const predictionUpperMap = Object.fromEntries(
    predictionPoints.map((p) => [p.label, p.yhat_upper])
  );

  const actualData = uniqueLabels.map((label) => actualMap[label] ?? null);
  const predictedData = uniqueLabels.map((label) => predictionMap[label] ?? null);
  const predictedLower = uniqueLabels.map(
    (label) => predictionLowerMap[label] ?? null
  );
  const predictedUpper = uniqueLabels.map(
    (label) => predictionUpperMap[label] ?? null
  );

  // We'll create a dataset for the uncertainty band (yhat_upper - yhat_lower)
  // Chart.js doesn't support error bars natively but we can simulate an area by stacking two datasets:
  // We'll create a "lower band" dataset that fills to the top with the "upper band" dataset.

  // Data for the uncertainty band = upper - lower
  const uncertaintyRange = predictedUpper.map((up, i) =>
    up !== null && predictedLower[i] !== null ? up - predictedLower[i] : null
  );

  const chartData = {
    labels: uniqueLabels,
    datasets: [
      {
        label: "Monthly Avg Power Consumption",
        data: actualData,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        type: "bar",
      },
      {
        label: "Prediction (Next 6 Months)",
        data: predictedData,
        backgroundColor: "rgba(255, 206, 86, 0.7)", // yellowish bars
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
        type: "bar",
      },
      {
        label: "Prediction Lower Bound",
        data: predictedLower,
        backgroundColor: "transparent",
        borderColor: "transparent",
        stack: "stack1",
        type: "bar",
        order: 1,
      },
      {
        label: "Prediction Uncertainty Range",
        data: uncertaintyRange,
        backgroundColor: "rgba(69, 62, 45, 0.3)", // lighter yellow
        borderColor: "transparent",
        stack: "stack1",
        type: "bar",
        order: 0,
        // This will create a shaded area for uncertainty on top of lower bound
      },
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
            Power Consumption Data & 6-Month Forecast (Dummy Data Test)
          </Typography>
          <Bar data={chartData} options={chartOptions} />
        </CardContent>
      </Card>
    </Container>
  );
}

export default UsageTracking;
