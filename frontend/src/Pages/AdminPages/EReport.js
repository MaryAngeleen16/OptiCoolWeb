import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, Snackbar, CircularProgress } from '@mui/material';
import axios from 'axios';
import Header from '../../Components/Layouts/Header';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../../Dashboard/StylesUsage.css';


export default function EReport() {
    const [reports, setReports] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [latestReport, setLatestReport] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API}/getreport`);
                if (response.status === 200) {
                    const data = response.data.reports;
                    setReports(data);

                    // Aggregate data for the chart
                    const applianceCounts = data.reduce((acc, report) => {
                        acc[report.appliance] = (acc[report.appliance] || 0) + 1;
                        return acc;
                    }, {});

                    setChartData({
                        labels: Object.keys(applianceCounts), // X-axis labels (appliance names)
                        datasets: [
                            {
                                label: 'Reports Count',
                                data: Object.values(applianceCounts), // Y-axis values (counts)
                                backgroundColor: 'rgba(54, 162, 235, 0.6)', // Bar color
                                borderColor: 'rgba(54, 162, 235, 1)', // Bar border color
                                borderWidth: 1,
                            },
                        ],
                    });

                    if (data.length > 0) {
                        const sortedReports = [...data].sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
                        setLatestReport(sortedReports[0]);
                        setOpenSnackbar(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        };

        fetchReports();
    }, []);

    const formatDate = (date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return (
        <div className="general-div">
            <Header />
            <Container style={{ marginTop: 20 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>Reports Overview</Typography>
                        {chartData ? (
                            <Bar
                                data={chartData}
                                options={{
                                    indexAxis: 'x', // Change to 'x' for horizontal bars, 'y' for vertical bars
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true, // Ensure the x-axis starts from 0
                                        },
                                        y: {
                                            beginAtZero: true, // Ensure the y-axis starts from 0
                                        },
                                    },
                                }}
                            />
                        ) : (
                            <CircularProgress />
                        )}
                    </CardContent>
                </Card>

                {latestReport && (
                    <Snackbar
                        open={openSnackbar}
                        autoHideDuration={6000}
                        onClose={() => setOpenSnackbar(false)}
                        message={`${latestReport.appliance} reported on ${formatDate(latestReport.reportDate)} at ${latestReport.reportTime}`}
                    />
                )}
            </Container>
        </div>
    );
}
