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

const HumidityUsage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API}/gethumidity`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  const sortedData = sortByTimestamp(data);

  // Split data in half assuming half is inside and half is outside
  const half = Math.floor(sortedData.length / 2);
  const insideData = sortedData.slice(0, half);
  const outsideData = sortedData.slice(half);

  // Use the shorter length for labels to avoid mismatch
  const minLen = Math.min(insideData.length, outsideData.length);
  const labels = insideData.slice(0, minLen).map(row => new Date(row.timestamp).toLocaleString());

  const chartData = {
    labels,
    datasets: [
      {
        label: "Inside Humidity (%)",
        data: insideData.slice(0, minLen).map(row => row.humidity),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Outside Humidity (%)",
        data: outsideData.slice(0, minLen).map(row => row.humidity),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Inside vs Outside Humidity Over Time" },
    },
    scales: {
      x: { title: { display: true, text: "Timestamp" }, stacked: false },
      y: { title: { display: true, text: "Humidity (%)" }, beginAtZero: true },
    },
  };

  return (
    <Container style={{ marginTop: 40 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Humidity Data
          </Typography>
          <Bar data={chartData} options={chartOptions} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default HumidityUsage;