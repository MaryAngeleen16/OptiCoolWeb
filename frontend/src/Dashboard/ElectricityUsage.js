import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import dmtUrl from '../dmtURL';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ElectricityUsage = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });
    const [error, setError] = useState(null);  // Add error state

    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                await axios.get(`${dmtUrl}/ping`);  // Assuming you have a "ping" endpoint for health check
                fetchData();  // Proceed with fetching the actual data if the server is online
            } catch (error) {
                setError('The Raspberry Pi is currently offline. Please check the connection.');
            }
        };

        const fetchData = async () => {
            try {
                const startDate = '2024-01-01';
                const endDate = '2025-02-05';
                const { data } = await axios.get(`${dmtUrl}/power_consumption_data?start_date=${startDate}&end_date=${endDate}`);
                
                const labels = data.map(entry => entry.date);
                const values = data.map(entry => entry.consumption);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Power Consumption (kWh)',
                            data: values,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        }
                    ]
                });
            } catch (error) {
                console.error('Error fetching power consumption data:', error);
            }
        };

        checkServerStatus();
    }, []);

    if (error) {
        return <div>{error}</div>;  // Display the error message if there's an issue
    }

    return (
        <div>
            <h2>Electricity Usage</h2>
            <Line data={chartData} />
        </div>
    );
};

export default ElectricityUsage;
