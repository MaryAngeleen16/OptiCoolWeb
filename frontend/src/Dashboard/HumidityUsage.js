import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import dmtUrl from '../dmtURL';
import './StylesUsage.css';



ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HumidityUsage = () => {
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

                // Fetch inside humidity data
                const insideResponse = await axios.get(`${dmtUrl}/inside_humidity_data?start_date=${startDate}&end_date=${endDate}`);
                const insideData = insideResponse.data;
                const insideLabels = insideData.map(entry => entry.date);
                const insideValues = insideData.map(entry => entry.humidity);

                // Fetch outside humidity data
                const outsideResponse = await axios.get(`${dmtUrl}/outside_humidity_data?start_date=${startDate}&end_date=${endDate}`);
                const outsideData = outsideResponse.data;
                const outsideValues = outsideData.map(entry => entry.humidity);

                setChartData({
                    labels: insideLabels,
                    datasets: [
                        {
                            label: 'Inside Humidity (%)',
                            data: insideValues,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgb(75, 192, 192)',
                            borderWidth: 1,
                        },
                        {
                            label: 'Outside Humidity (%)',
                            data: outsideValues,
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderColor: 'rgb(255, 99, 132)',
                            borderWidth: 1,
                        }
                    ]
                });
            } catch (error) {
                console.error('Error fetching humidity data:', error);
            }
        };

        checkServerStatus();
    }, []);

    if (error) {
        return <div>{error}</div>;  // Display the error message if there's an issue
    }

    return (
        <div style={{marginTop: '5%'}} className="chart">
            <h2 style={{textAlign: 'center'}}>Humidity Report</h2>
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Inside vs Outside Humidity' } } }} />
        </div>
    );
};

export default HumidityUsage;










// import React, { useEffect, useState } from 'react';
// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
// import './StylesUsage.css';

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const HumidityUsage = () => {
//     const [chartData, setChartData] = useState({
//         labels: [],
//         datasets: []
//     });
//     const [error, setError] = useState(null);  // Add error state

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 // Dummy data for inside humidity
//                 const insideData = [
//                     { date: '2024-01-01', humidity: 45 },
//                     { date: '2024-01-02', humidity: 50 },
//                     { date: '2024-01-03', humidity: 55 },
//                     { date: '2024-01-04', humidity: 60 },
//                     { date: '2024-01-05', humidity: 65 },
//                 ];
//                 const insideLabels = insideData.map(entry => entry.date);
//                 const insideValues = insideData.map(entry => entry.humidity);

//                 // Dummy data for outside humidity
//                 const outsideData = [
//                     { date: '2024-01-01', humidity: 40 },
//                     { date: '2024-01-02', humidity: 42 },
//                     { date: '2024-01-03', humidity: 44 },
//                     { date: '2024-01-04', humidity: 46 },
//                     { date: '2024-01-05', humidity: 48 },
//                 ];
//                 const outsideValues = outsideData.map(entry => entry.humidity);

//                 setChartData({
//                     labels: insideLabels,
//                     datasets: [
//                         {
//                             label: 'Inside Humidity (%)',
//                             data: insideValues,
//                             backgroundColor: 'rgba(75, 192, 192, 0.2)',
//                             borderColor: 'rgb(75, 192, 192)',
//                             borderWidth: 1,
//                         },
//                         {
//                             label: 'Outside Humidity (%)',
//                             data: outsideValues,
//                             backgroundColor: 'rgba(255, 99, 132, 0.2)',
//                             borderColor: 'rgb(255, 99, 132)',
//                             borderWidth: 1,
//                         }
//                     ]
//                 });
//             } catch (error) {
//                 console.error('Error fetching humidity data:', error);
//                 setError('Error fetching humidity data');
//             }
//         };

//         fetchData();
//     }, []);

//     if (error) {
//         return <div>{error}</div>;  // Display the error message if there's an issue
//     }

//     return (
//         <div style={{ marginTop: '5%' }} className="chart">
//             <h2>Humidity Report</h2>
//             <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Inside vs Outside Humidity' } } }} />
//         </div>
//     );
// };

// export default HumidityUsage;
