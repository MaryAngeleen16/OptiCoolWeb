import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register the required components for Chart.js
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

// Generate dummy humidity data between 30% and 70% without decimals
const generateDummyHumidityData = () => {
    const dummyData = [];
    const totalDays = 7;
    const hoursPerDay = 10;

    for (let day = 1; day <= totalDays; day++) {
        const hourlyHumidityInside = [];
        const hourlyHumidityOutside = [];
        for (let hour = 1; hour <= hoursPerDay; hour++) {
            hourlyHumidityInside.push(Math.floor(Math.random() * (51 - 30) + 30)); // Random inside humidity
            hourlyHumidityOutside.push(Math.floor(Math.random() * (51 - 30) + 30)); // Random outside humidity
        }
        dummyData.push({
            date: `Day ${day}`, // Use simple day labels
            hourlyHumidityInside,
            hourlyHumidityOutside,
        });
    }
    return dummyData;
};

const HumidityUsage = () => {
    const data = generateDummyHumidityData();
    const dailyHumidityInside = data[0].hourlyHumidityInside;
    const dailyHumidityOutside = data[0].hourlyHumidityOutside;

    const barChartData = {
        labels: Array.from({ length: dailyHumidityInside.length }, (_, i) => `H${i + 1}`),
        datasets: [
            {
                label: 'Inside Humidity (%)',
                data: dailyHumidityInside,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: 'Outside Humidity (%)',
                data: dailyHumidityOutside,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Humidity Report',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div style={{ padding: '20px', height: '500px', marginTop: '5%', marginBottom: '5%' }}>
         <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Humidity Usage Report</h1>

            <Bar data={barChartData} options={options} />
        </div>
    );
};

export default HumidityUsage;
