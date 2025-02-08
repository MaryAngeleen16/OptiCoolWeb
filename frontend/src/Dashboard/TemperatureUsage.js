// import React from 'react';
// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
// import './StylesUsage.css';
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// // Generate dummy temperature data
// const generateDummyTemperatureData = () => {
//     const dummyData = [];
//     const totalDays = 7; // One week
//     const hoursPerDay = 10; // 10 hours of data per day

//     for (let day = 1; day <= totalDays; day++) {
//         const hourlyTemperatureInside = [];
//         const hourlyTemperatureOutside = [];
//         for (let hour = 1; hour <= hoursPerDay; hour++) {
//             hourlyTemperatureInside.push(Math.floor(Math.random() * (45 - 16) + 16)); // Inside temp between 16°C and 45°C
//             hourlyTemperatureOutside.push(Math.floor(Math.random() * (45 - 16) + 16)); // Outside temp between 16°C and 45°C
//         }
//         dummyData.push({
//             date: `Day ${day}`,
//             hourlyTemperatureInside,
//             hourlyTemperatureOutside,
//         });
//     }
//     return dummyData;
// };

// const TemperatureUsage = () => {
//     const data = generateDummyTemperatureData();
//     const dailyTemperatureInside = data[0].hourlyTemperatureInside;
//     const dailyTemperatureOutside = data[0].hourlyTemperatureOutside;

//     // Prepare the bar chart data
//     const barChartData = {
//         labels: Array.from({ length: dailyTemperatureInside.length }, (_, i) => `H${i + 1}`),
//         datasets: [
//             {
//                 label: 'Inside Temperature (°C)',
//                 data: dailyTemperatureInside,
//                 backgroundColor: 'rgba(75, 192, 192, 0.2)',
//                 borderColor: 'rgb(75, 192, 126)',
//                 borderWidth: 1,
//             },
//             {
//                 label: 'Outside Temperature (°C)',
//                 data: dailyTemperatureOutside,
//                 backgroundColor: 'rgba(255, 99, 132, 0.2)',
//                 borderColor: 'rgb(239, 124, 52)',
//                 borderWidth: 1,
//             },
//         ],
//     };

//     const options = {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//             legend: {
//                 position: 'top',
//             },
//             title: {
//                 display: true,
//                 text: 'Temperature Report',
//             },
//         },
//         scales: {
//             y: {
//                 beginAtZero: true,
//             },
//         },
//     };

//     return (
//         <div className="chart">
//            <h4 style={{ textAlign: 'center', marginBottom: '5px' }}>Temperature Report</h4>
          
//             <Bar style={{paddingBottom: '40px' }}
//             data={barChartData} options={options} />
//         </div>
//     );
// };

// export default TemperatureUsage;















import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import dmtUrl from '../dmtURL';
import './StylesUsage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TemperatureUsage = () => {
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

                // Fetch inside temperature data
                const insideResponse = await axios.get(`${dmtUrl}/inside_temperature_data?start_date=${startDate}&end_date=${endDate}`);
                const insideData = insideResponse.data;
                const insideLabels = insideData.map(entry => entry.date);
                const insideValues = insideData.map(entry => entry.temperature);

                // Fetch outside temperature data
                const outsideResponse = await axios.get(`${dmtUrl}/outside_temperature_data?start_date=${startDate}&end_date=${endDate}`);
                const outsideData = outsideResponse.data;
                const outsideValues = outsideData.map(entry => entry.temperature);

                setChartData({
                    labels: insideLabels,
                    datasets: [
                        {
                            label: 'Inside Temperature (°C)',
                            data: insideValues,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgb(75, 192, 192)',
                            borderWidth: 1,
                        },
                        {
                            label: 'Outside Temperature (°C)',
                            data: outsideValues,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgb(255, 99, 132)',
                            borderWidth: 1,
                        }
                    ]
                });
            } catch (error) {
                console.error('Error fetching temperature data:', error);
                setError('Error fetching temperature data');
            }
        };

        checkServerStatus();
    }, []);

    if (error) {
        return <div>{error}</div>;  // Display the error message if there's an issue
    }

    return (
        <div style={{ marginTop: '5%' }} className="chart">
            <h2 style={{ textAlign: 'center' }}>Temperature Report</h2>
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Inside vs Outside Temperature' } } }} />
        </div>
    );
};

export default TemperatureUsage;

