import { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
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

  // Split data into two halves: inside and outside
  const half = Math.floor(sortedData.length / 2);
  const insideData = sortedData.slice(0, half);
  const outsideData = sortedData.slice(half);

  const chartData = {
    labels: insideData.map(row => new Date(row.timestamp).toLocaleString()), // assuming same timestamps
    datasets: [
      {
        label: "Inside Temperature (°C)",
        data: insideData.map(row => row.temperature),
        backgroundColor: "rgba(0, 123, 255, 0.8)", // more solid blue
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: "Outside Temperature (°C)",
        data: outsideData.map(row => row.temperature),
        backgroundColor: "rgba(255, 99, 132, 0.8)", // more solid red
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        tension: 0.1,
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
        ticks: {
          stepSize: 10, // increments by 10
          callback: function(value) {
            return value; // show the value as is
          }
        },
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
