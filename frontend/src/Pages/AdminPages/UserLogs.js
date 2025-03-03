import React, { useEffect, useState } from 'react';
import Header from '../../Components/Layouts/Header';
import { Container, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import axios from 'axios';

export default function UserLogs() {
    const [logs, setLogs] = useState([]);

    const fetchUserLogs = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/loglist`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setLogs(data.logs);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUserLogs();
    }, []);

    return (
        <div>
            <Header />
            <Container sx={{ mt: 15 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Timestamp</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log._id}>
                                <TableCell>{log.user}</TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Container>
        </div>
    );
}
