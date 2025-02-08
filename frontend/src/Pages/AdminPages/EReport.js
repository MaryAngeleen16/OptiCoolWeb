import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, Snackbar, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
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
    const [sortedAppliances, setSortedAppliances] = useState([]);

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
                                barThickness: 50, // Adjust bar thickness
                            },
                        ],
                    });

                    // Sort appliances by count in descending order
                    const sorted = Object.entries(applianceCounts).sort((a, b) => b[1] - a[1]);
                    setSortedAppliances(sorted);

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
        <div
            style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f9f9f9',
            }}
        >
            <Container style={{ maxWidth: '75%', marginTop: '30%' }}>
                <Header />
                <Card style={{ marginTop: '10%', width: '100%' }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>Reports Overview</Typography>
                        {chartData ? (
                            <div style={{ width: '100%' }}>
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
                            </div>
                        ) : (
                            <CircularProgress />
                        )}
                    </CardContent>
                </Card>

                <Card style={{ marginTop: 20, width: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Most to Least Reported Appliances</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rank</TableCell>
                                        <TableCell>Appliance</TableCell>
                                        <TableCell align="right">Total Counts</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedAppliances.map(([appliance, count], index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{appliance}</TableCell>
                                            <TableCell align="right">{count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
