import { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import "chart.js/auto";
import './StylesUsage.css';

// Helper function to sort data by timestamp ascending
function sortByTimestamp(data) {
  return [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

const TemperatureUsage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API}/gettemperature`)
      .then(res => {
        console.log("Fetched temperature data:", res.data); // Debug: log the data
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching temperature data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <CircularProgress />;

  const sortedData = sortByTimestamp(data);

  // For temperature, use the temperature field, not humidity
  // If you want to split inside/outside, you must have a way to distinguish them in your data.
  // For now, just show all as a single line chart.
  const chartData = {
    labels: sortedData.map(row => new Date(row.timestamp).toLocaleString()),
    datasets: [
      {
        label: "Temperature (°C)",
        data: sortedData.map(row => row.temperature),
        fill: false,
        borderColor: "rgba(255, 140, 0, 1)",
        backgroundColor: "rgba(255, 140, 0, 0.2)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Temperature Over Time" },
    },
    scales: {
      x: { title: { display: true, text: "Timestamp" } },
      y: { title: { display: true, text: "Temperature (°C)" }, beginAtZero: false },
    },
  };

  return (
    <Container style={{ marginTop: 40 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Temperature Data
          </Typography>
          <Line data={chartData} options={chartOptions} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default TemperatureUsage;