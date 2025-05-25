import { useEffect, useState } from 'react'
import {
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";

function UsageTracking() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:4000/api/v1/getpowerconsumption')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Container style={{ marginTop: 40 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Power Consumption Data
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Consumption</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={row._id || idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{row.consumption}</TableCell>
                    <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  )
}

export default UsageTracking