import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import moment from "moment-timezone";
import ReactPaginate from "react-paginate";
import Sidebar from "../../Components/Layouts/Sidebar";

import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";

import "./ActivityLog.css";

const ITEMS_PER_PAGE = 10;

const ActivityLog = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchActivityLogs = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API}/activity-log`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setLogs(response.data.logs);
      } else {
        console.error("Failed to fetch logs:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  // ✅ Sort logs from newest to oldest
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const pageCount = Math.ceil(sortedLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = sortedLogs.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div style={{ marginTop: "-45%" }}>
      <Sidebar />
      <Container maxWidth="lg">
        <Typography variant="h4" className="log-title" gutterBottom>
          Activity Log
        </Typography>

        {loading ? (
          <div className="centered">
            <CircularProgress />
            <p className="loading-text">Loading activity logs...</p>
          </div>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Username</strong></TableCell>
                    <TableCell><strong>Action</strong></TableCell>
                    <TableCell><strong>Timestamp</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>{log.userId?.username || "Unknown User"}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        {moment(log.timestamp)
                          .tz("Asia/Manila")
                          .format("YYYY-MM-DD hh:mm A")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <div className="pagination-container">
              <ReactPaginate
                previousLabel={"← Prev"}
                nextLabel={"Next →"}
                breakLabel={"..."}
                pageCount={pageCount}
                onPageChange={handlePageChange}
                containerClassName={"pagination"}
                activeClassName={"active"}
                pageRangeDisplayed={2}
                marginPagesDisplayed={1}
              />
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default ActivityLog;
