import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import './StylesUsage.css';
// Register the necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

// Generate dummy data
const generateDummyData = () => {
    const dummyData = [];
    const totalDays = 60; // 60 days of reports
    const hoursPerDay = 12;

    for (let day = 1; day <= totalDays; day++) {
        const hourlyUsage = [];
        for (let hour = 1; hour <= hoursPerDay; hour++) {
            hourlyUsage.push(parseFloat((Math.random() * 5 + 1).toFixed(2))); // Random usage between 1 to 6 kWh
        }
        dummyData.push({
            day: day,
            date: new Date(2024, 0, day),
            hourlyUsage: hourlyUsage,
        });
    }
    return dummyData;
};

// Aggregate data by week and month
const aggregateData = (data) => {
    const weeklyData = [];
    const monthlyData = [];

    let weekTotal = 0;
    let monthTotal = 0;
    let weekCount = 0;

    data.forEach((dayData, index) => {
        const dailyTotal = dayData.hourlyUsage.reduce((a, b) => a + b, 0);
        weekTotal += dailyTotal;
        monthTotal += dailyTotal;

        if ((index + 1) % 5 === 0) {
            weeklyData.push(parseFloat(weekTotal.toFixed(2)));
            weekTotal = 0;
            weekCount += 1;
        }

        if (weekCount === 4) {
            monthlyData.push(parseFloat(monthTotal.toFixed(2)));
            monthTotal = 0;
            weekCount = 0;
        }
    });

    return { weeklyData, monthlyData };
};

const ElectricityUsage = () => {
    const data = generateDummyData();
    const { weeklyData, monthlyData } = aggregateData(data);

    // Hourly data for the first day
    const hourlyData = data[0].hourlyUsage;

    return (
        <div>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Power Consumption Report</h1>

            <section className="general-div">
                <h2 >Daily</h2>
                <Line
                    data={{
                        labels: Array.from({ length: hourlyData.length }, (_, i) => `H${i + 1}`),
                        datasets: [
                            {
                                label: 'Hourly Usage (kWh)',
                                data: hourlyData,
                                backgroundColor: 'rgba(90, 167, 57, 0.2)',
                                borderColor: 'rgba(90, 167, 57, 1)',
                                borderWidth: 2,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { display: true },
                        },
                    }}
                />
            </section>

            <section className="general-div">
                <h2>Weekly</h2>
                <Line
                    data={{
                        labels: weeklyData.map((_, index) => `W${index + 1}`),
                        datasets: [
                            {
                                label: 'Weekly Usage (kWh)',
                                data: weeklyData,
                                backgroundColor: 'rgba(205, 89, 29, 0.2)',
                                borderColor: 'rgba(205, 89, 29, 1)',
                                borderWidth: 2,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { display: true },
                        },
                    }}
                />
            </section>

            <section className="general-div">
                <h2>Monthly</h2>
                <Line
                    data={{
                        labels: monthlyData.map((_, index) => `Month ${index + 1}`),
                        datasets: [
                            {
                                label: 'Monthly Usage (kWh)',
                                data: monthlyData,
                                backgroundColor: 'rgba(131, 75, 224, 0.2)',
                                borderColor: 'rgba(131, 75, 224, 1)',
                                borderWidth: 2,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { display: true },
                        },
                    }}
                />
            </section>
        </div>
    );
};

export default ElectricityUsage;
