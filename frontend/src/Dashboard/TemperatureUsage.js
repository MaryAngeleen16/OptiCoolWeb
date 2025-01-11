import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './StylesUsage.css';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Generate dummy temperature data
const generateDummyTemperatureData = () => {
    const dummyData = [];
    const totalDays = 7; // One week
    const hoursPerDay = 10; // 10 hours of data per day

    for (let day = 1; day <= totalDays; day++) {
        const hourlyTemperatureInside = [];
        const hourlyTemperatureOutside = [];
        for (let hour = 1; hour <= hoursPerDay; hour++) {
            hourlyTemperatureInside.push(Math.floor(Math.random() * (45 - 16) + 16)); // Inside temp between 16°C and 45°C
            hourlyTemperatureOutside.push(Math.floor(Math.random() * (45 - 16) + 16)); // Outside temp between 16°C and 45°C
        }
        dummyData.push({
            date: `Day ${day}`,
            hourlyTemperatureInside,
            hourlyTemperatureOutside,
        });
    }
    return dummyData;
};

const TemperatureUsage = () => {
    const data = generateDummyTemperatureData();
    const dailyTemperatureInside = data[0].hourlyTemperatureInside;
    const dailyTemperatureOutside = data[0].hourlyTemperatureOutside;

    // Prepare the bar chart data
    const barChartData = {
        labels: Array.from({ length: dailyTemperatureInside.length }, (_, i) => `H${i + 1}`),
        datasets: [
            {
                label: 'Inside Temperature (°C)',
                data: dailyTemperatureInside,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 126)',
                borderWidth: 1,
            },
            {
                label: 'Outside Temperature (°C)',
                data: dailyTemperatureOutside,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(239, 124, 52)',
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
                text: 'Temperature Report',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="general-div">
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Temperature Usage Report</h1>
            <Bar data={barChartData} options={options} />
        </div>
    );
};

export default TemperatureUsage;
