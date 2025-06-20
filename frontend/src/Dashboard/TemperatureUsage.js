import { useEffect, useState } from "react";
import { Container, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./StylesUsage.css";

function sortByTimestamp(data) {
  return [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

const TemperatureUsage = () => {
  const [insideData, setInsideData] = useState([]);
  const [outsideData, setOutsideData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemps = async () => {
      try {
        const [insideRes, outsideRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API}/insidetemperatures`),
          axios.get(`${process.env.REACT_APP_API}/outsidetemperatures`)
        ]);
        setInsideData(sortByTimestamp(insideRes.data));
        setOutsideData(sortByTimestamp(outsideRes.data));
      } catch (err) {
        console.error("Error fetching temperature data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemps();
  }, []);

  if (loading) return <CircularProgress />;

  // Use the shorter length for labels to avoid mismatch
  const minLen = Math.min(insideData.length, outsideData.length);
  const labels = insideData.slice(0, minLen).map(row => new Date(row.timestamp).toLocaleString());

  const chartData = {
    labels,
    datasets: [
      {
        label: "Inside Temperature (°C)",
        data: insideData.slice(0, minLen).map(row => row.temperature),
        backgroundColor: "rgba(0, 123, 255, 0.8)",
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 2,
      },
      {
        label: "Outside Temperature (°C)",
        data: outsideData.slice(0, minLen).map(row => row.temperature),
        backgroundColor: "rgba(255, 99, 132, 0.8)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Inside vs Outside Temperature Over Time" },
    },
    scales: {
      x: { title: { display: true, text: "Timestamp" } },
      y: {
        title: { display: true, text: "Temperature (°C)" },
        beginAtZero: true,
      },
    },
  };

  return (
    <Container style={{ marginTop: 40 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Temperature Data
          </Typography>
          <Bar data={chartData} options={chartOptions} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default TemperatureUsage;