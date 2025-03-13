import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './UsageTracking.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UsageTracking = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [chartData, setChartData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [20, 45, 28, 80, 99, 43] }],
  });
  const [todayUsage, setTodayUsage] = useState(50);
  const [monthlyUsage, setMonthlyUsage] = useState(300);
  const [loading, setLoading] = useState(false);
  const [powerData, setPowerData] = useState([]);

  useEffect(() => {
    console.log("Component mounted, fetching initial data...");
    fetchPowerData();
  }, []);

  const fetchPowerData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/power-consumption/getpowerconsumption`);
      const data = response.data;
      setPowerData(data); // Set power data for the table

      // Update chart data
      const labels = data.map(item => new Date(item.timestamp).toLocaleDateString());
      const consumptionData = data.map(item => item.consumption);
      setChartData({
        labels,
        datasets: [{ label: 'Power Consumption (kWh)', data: consumptionData }],
      });

      // Update summary data
      const totalConsumption = consumptionData.reduce((acc, value) => acc + value, 0);
      setTodayUsage(consumptionData[consumptionData.length - 1] || 0);
      setMonthlyUsage(totalConsumption);
    } catch (error) {
      alert("Error: Failed to fetch power data");
      console.error("Error fetching power data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="general-div">
      {loading ? (
        <div className="loading">
          <p>Loading...</p>
        </div>
      ) : (
        <>
   
            <div className="chart">
              <Bar
                data={chartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'kW',
                      },
                    },
                  },
                }}
              />
            </div>
       

    
        </>
      )}
    </div>
  );
};

export default UsageTracking;