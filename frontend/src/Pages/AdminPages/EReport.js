import { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Snackbar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "../../Dashboard/StylesUsage.css";
import ReactPaginate from "react-paginate";
import Sidebar from "../../Components/Layouts/Sidebar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function EReport() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [latestReport, setLatestReport] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [sortedAppliances, setSortedAppliances] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const reportsPerPage = 10;

  useEffect(() => {
    const fetchReportsAndUsers = async () => {
      try {
        const [reportsResponse, usersResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API}/getreport`),
          axios.get(`${process.env.REACT_APP_API}/users/all`),
        ]);

        if (reportsResponse.status === 200 && usersResponse.status === 200) {
          const reportsData = reportsResponse.data.reports;
          const usersData = usersResponse.data.users;

          setReports(reportsData);
          setUsers(usersData);

          const applianceCounts = reportsData.reduce((acc, report) => {
            let applianceKey = report.appliance.toLowerCase();
            if (applianceKey.includes("ac")) {
              applianceKey = "AC";
            } else if (
              applianceKey.includes("fan") &&
              !applianceKey.includes("exhaust")
            ) {
              applianceKey = "Fan";
            } else if (applianceKey.includes("exhaust")) {
              applianceKey = "Exhaust Fan";
            } else if (applianceKey.includes("blower")) {
              applianceKey = "Blower";
            } else {
              applianceKey = report.appliance;
            }
            acc[applianceKey] = (acc[applianceKey] || 0) + 1;
            return acc;
          }, {});

          setChartData({
            labels: Object.keys(applianceCounts),
            datasets: [
              {
                label: "Reports Count",
                data: Object.values(applianceCounts),
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
                barThickness: 50,
              },
            ],
          });

          const sorted = Object.entries(applianceCounts).sort(
            (a, b) => b[1] - a[1]
          );
          setSortedAppliances(sorted);

          if (reportsData.length > 0) {
            const sortedReports = [...reportsData].sort(
              (a, b) => new Date(b.reportDate) - new Date(a.reportDate)
            );
            setLatestReport(sortedReports[0]);
            setOpenSnackbar(true);
          }

          setPageCount(Math.ceil(reportsData.length / reportsPerPage));
        }
      } catch (error) {
        console.error("Error fetching reports and users:", error);
      }
    };

    fetchReportsAndUsers();
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);
  if (!user || user.role !== "admin") return null;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

  const getUserInfo = (userId) => {
    const user = users.find((user) => user._id === userId);
    return user
      ? { email: user.email, username: user.username }
      : { email: "N/A", username: "N/A" };
  };

  const handlePageClick = (data) => {
    const selectedPage = data.selected;
    setCurrentPage(selectedPage);
  };

  const markAsResolved = async (reportId) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API}/ereport/${reportId}/resolve`
      );
      setReports((prevReports) =>
        prevReports.map((r) =>
          r._id === reportId ? { ...r, isResolved: "yes" } : r
        )
      );
    } catch (err) {
      console.error("Failed to mark as resolved:", err);
    }
  };

  // Filter and sort reports
  const filteredReports = showPendingOnly
    ? reports.filter((r) => r.isResolved === "no")
    : reports;
  const sortedReports = [...filteredReports].sort(
    (a, b) => new Date(b.reportDate) - new Date(a.reportDate)
  );
  const offset = currentPage * reportsPerPage;
  const currentReports = sortedReports.slice(offset, offset + reportsPerPage);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        marginTop: "35%",
      }}
    >
      <Sidebar />
      <Container style={{ maxWidth: "75%", marginTop: "30%" }}>
        <Card style={{ marginTop: "10%", width: "100%" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Reports Overview
            </Typography>
            {chartData ? (
              <div style={{ width: "100%" }}>
                <Bar
                  data={chartData}
                  options={{
                    indexAxis: "x",
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                    },
                    scales: {
                      x: { beginAtZero: true },
                      y: { beginAtZero: true },
                    },
                  }}
                />
              </div>
            ) : (
              <CircularProgress />
            )}
          </CardContent>
        </Card>

        <Card style={{ marginTop: 20, width: "100%" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Most to Least Reported Appliances
            </Typography>
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

        <Card style={{ marginTop: 20, width: "100%" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Reports
            </Typography>
            <Button
              variant="contained"
              color={showPendingOnly ? "primary" : "success"}
              style={{
                marginBottom: 12,
                color: showPendingOnly ? "#fff" : undefined,
                background: showPendingOnly ? "#ffa726" : undefined,
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseOut={(e) =>
                (e.currentTarget.style.color = showPendingOnly ? "#fff" : "")
              }
              onClick={() => {
                setShowPendingOnly((v) => !v);
                setCurrentPage(0);
              }}
            >
              {showPendingOnly ? "Show All Reports" : "Show Only Pending"}
            </Button>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Appliance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Report Date</TableCell>
                    <TableCell>Report Time</TableCell>
                    <TableCell>Reported By (Username)</TableCell>
                    <TableCell>Resolved?</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentReports.map((report, index) => {
                    const userInfo = getUserInfo(report.user?._id);
                    const description = report.description || report.status;
                    return (
                      <TableRow key={index}>
                        <TableCell>{report.appliance}</TableCell>
                        <TableCell>{report.status}</TableCell>
                        <TableCell>{description}</TableCell>
                        <TableCell>{formatDate(report.reportDate)}</TableCell>
                        <TableCell>{report.timeReported}</TableCell>
                        <TableCell>{userInfo.username}</TableCell>
                        <TableCell>{report.isResolved}</TableCell>
                        <TableCell>
                          {report.isResolved !== "yes" && (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => markAsResolved(report._id)}
                            >
                              Mark as Resolved
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <ReactPaginate
              previousLabel={"← Previous"}
              nextLabel={"Next →"}
              pageCount={pageCount}
              onPageChange={handlePageClick}
              forcePage={currentPage}
              containerClassName={"pagination"}
              activeClassName={"active"}
              pageRangeDisplayed={2}
              marginPagesDisplayed={1}
              breakLabel={"..."}
              renderOnZeroPageCount={null}
            />
          </CardContent>
        </Card>

        {latestReport && (
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={() => setOpenSnackbar(false)}
            message={`${latestReport.appliance} reported on ${formatDate(
              latestReport.reportDate
            )} at ${latestReport.timeReported}`}
          />
        )}
      </Container>
    </div>
  );
}
