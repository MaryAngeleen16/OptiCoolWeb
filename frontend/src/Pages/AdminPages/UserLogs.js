import React, { useEffect, useState } from 'react';
import Header from '../../Components/Layouts/Header';
import { Container, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper } from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux'; // Import useSelector from react-redux
import ReactPaginate from 'react-paginate';

export default function UserLogs() {
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]); // State to store users
    const [currentPage, setCurrentPage] = useState(0); // State to store current page
    const logsPerPage = 10; // Number of logs per page
    const { user, token } = useSelector(state => state.auth); // Get user and token from Redux store

    const fetchUserLogs = async () => {
        try {
            const [logsResponse, usersResponse] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API}/loglist`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token in request headers
                    },
                }),
                axios.get(`${process.env.REACT_APP_API}/users/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token in request headers
                    },
                }),
            ]);

            if (logsResponse.status === 200 && usersResponse.status === 200) {
                setLogs(logsResponse.data.logs);
                setUsers(usersResponse.data.users);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUserLogs();
    }, []);

    const getUserInfo = (userId) => {
        const user = users.find((user) => user._id === userId);
        return user ? { email: user.email, username: user.username } : { email: "N/A", username: "N/A" };
    };

    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };

    // Sort logs from newest to oldest
    const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Calculate the logs to display on the current page
    const offset = currentPage * logsPerPage;
    const currentLogs = sortedLogs.slice(offset, offset + logsPerPage);

    return (
        <div>
            <Header />
            <Container sx={{ mt: 15 }}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>Email</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentLogs.map((log, index) => {
                                const userInfo = getUserInfo(log.user._id);
                                return (
                                    <TableRow key={index}>
                                         <TableCell>{userInfo.username}</TableCell>
                                        <TableCell>{log.action}</TableCell>
                                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                        <TableCell>{userInfo.email}</TableCell>
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
                    pageCount={Math.ceil(logs.length / logsPerPage)}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    subContainerClassName={"pages pagination"}
                    activeClassName={"active"}
                />
            </Container>
        </div>
    );
}
