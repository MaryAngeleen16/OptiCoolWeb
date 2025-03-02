import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, Snackbar, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';
import Header from '../../Components/Layouts/Header';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../../Dashboard/StylesUsage.css';
import ReactPaginate from 'react-paginate'; // Import ReactPaginate

export default function EReport() {
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [latestReport, setLatestReport] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [sortedAppliances, setSortedAppliances] = useState([]);
    const [pageCount, setPageCount] = useState(0); // State to store page count
    const [currentPage, setCurrentPage] = useState(0); // State to store current page
    const reportsPerPage = 10; // Number of reports per page

    useEffect(() => {
        const fetchReportsAndUsers = async () => {
            try {
                const [reportsResponse, usersResponse] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API}/getreport`),
                    axios.get(`${process.env.REACT_APP_API}/users/all`)
                ]);

                if (reportsResponse.status === 200 && usersResponse.status === 200) {
                    const reportsData = reportsResponse.data.reports;
                    const usersData = usersResponse.data.users;

                    setReports(reportsData);
                    setUsers(usersData);

                    // Aggregate data for the chart
                    const applianceCounts = reportsData.reduce((acc, report) => {
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

                    if (reportsData.length > 0) {
                        const sortedReports = [...reportsData].sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
                        setLatestReport(sortedReports[0]);
                        setOpenSnackbar(true);
                    }

                    // Set the page count for pagination
                    setPageCount(Math.ceil(reportsData.length / reportsPerPage));
                }
            } catch (error) {
                console.error('Error fetching reports and users:', error);
            }
        };

        fetchReportsAndUsers();
    }, []);

    const formatDate = (date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const getUserInfo = (userId) => {
        const user = users.find(user => user._id === userId);
        return user ? { email: user.email, username: user.username } : { email: 'N/A', username: 'N/A' };
    };

    const handlePageClick = (data) => {
        const selectedPage = data.selected;
        setCurrentPage(selectedPage);
    };

    // Calculate the reports to display on the current page
    const offset = currentPage * reportsPerPage;
    const sortedReports = [...reports].sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));
    const currentReports = sortedReports.slice(offset, offset + reportsPerPage);

    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f9f9f9',
                marginTop: '20%',
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

                <Card style={{ marginTop: 20, width: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>All Reports</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Appliance</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Report Date</TableCell>
                                        <TableCell>Report Time</TableCell>
                                        <TableCell>Reported By (Email)</TableCell>
                                        <TableCell>Reported By (Username)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentReports.map((report, index) => {
                                        const userInfo = getUserInfo(report.user);
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{report.appliance}</TableCell>
                                                <TableCell>{report.status}</TableCell>
                                                <TableCell>{formatDate(report.reportDate)}</TableCell>
                                                <TableCell>{report.timeReported}</TableCell>
                                                <TableCell>{userInfo.email}</TableCell>
                                                <TableCell>{userInfo.username}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <ReactPaginate
                            previousLabel={"previous"}
                            nextLabel={"next"}
                            breakLabel={"..."}
                            breakClassName={"break-me"}
                            pageCount={pageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={5}
                            onPageChange={handlePageClick}
                            containerClassName={"pagination"}
                            subContainerClassName={"pages pagination"}
                            activeClassName={"active"}
                        />
                    </CardContent>
                </Card>

                {latestReport && (
                    <Snackbar
                        open={openSnackbar}
                        autoHideDuration={6000}
                        onClose={() => setOpenSnackbar(false)}
                        message={`${latestReport.appliance} reported on ${formatDate(latestReport.reportDate)} at ${latestReport.timeReported}`}
                    />
                )}
            </Container>
        </div>
    );
}
