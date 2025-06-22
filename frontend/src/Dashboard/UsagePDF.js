import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import { Button, Dialog, DialogTitle, DialogContent, Typography, FormGroup, FormControlLabel, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

function getMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}
function inRange(date, start, end) {
  const d = new Date(date);
  return (!start || d >= new Date(start + '-01')) && (!end || d <= new Date(end + '-31'));
}

export default function UsagePDFButton() {
  const [open, setOpen] = useState(false);
  const [insideTemp, setInsideTemp] = useState([]);
  const [outsideTemp, setOutsideTemp] = useState([]);
  const [insideHum, setInsideHum] = useState([]);
  const [outsideHum, setOutsideHum] = useState([]);
  const [powerData, setPowerData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [selectedUsages, setSelectedUsages] = useState({
    tempHum: true,
    power: true,
  });

  const tableRef = useRef(null);
  const chartRefs = {
    tempHum: useRef(null),
    power: useRef(null),
  };

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      axios.get(`${process.env.REACT_APP_API}/insidetemperatures`),
      axios.get(`${process.env.REACT_APP_API}/outsidetemperatures`),
      axios.get(`${process.env.REACT_APP_API}/insidehumidities`),
      axios.get(`${process.env.REACT_APP_API}/outsidehumidities`),
      axios.get(`${process.env.REACT_APP_API}/powerconsumptions`)
    ])
      .then(([inTempRes, outTempRes, inHumRes, outHumRes, powerRes]) => {
        setInsideTemp(Array.isArray(inTempRes.data) ? inTempRes.data : []);
        setOutsideTemp(Array.isArray(outTempRes.data) ? outTempRes.data : []);
        setInsideHum(Array.isArray(inHumRes.data) ? inHumRes.data : []);
        setOutsideHum(Array.isArray(outHumRes.data) ? outHumRes.data : []);
        setPowerData(Array.isArray(powerRes.data) ? powerRes.data : []);
      })
      .catch(() => {
        setInsideTemp([]); setOutsideTemp([]); setInsideHum([]); setOutsideHum([]); setPowerData([]);
      })
      .finally(() => setLoading(false));
  }, [open]);

  // Filter data by range
  const filteredInsideTemp = insideTemp.filter(row => inRange(row.timestamp, startMonth, endMonth));
  const filteredOutsideTemp = outsideTemp.filter(row => inRange(row.timestamp, startMonth, endMonth));
  const filteredInsideHum = insideHum.filter(row => inRange(row.timestamp, startMonth, endMonth));
  const filteredOutsideHum = outsideHum.filter(row => inRange(row.timestamp, startMonth, endMonth));
  const filteredPower = powerData.filter(row => inRange(row.timestamp, startMonth, endMonth));

  // Merge all data by date (YYYY-MM-DD)
  const allDates = Array.from(new Set([
    ...filteredInsideTemp.map(r => r.timestamp?.slice(0, 10)),
    ...filteredOutsideTemp.map(r => r.timestamp?.slice(0, 10)),
    ...filteredInsideHum.map(r => r.timestamp?.slice(0, 10)),
    ...filteredOutsideHum.map(r => r.timestamp?.slice(0, 10)),
    ...filteredPower.map(r => r.timestamp?.slice(0, 10)),
  ])).filter(Boolean).sort();

  const mergedRows = allDates.map(date => {
    const inTemp = filteredInsideTemp.find(r => r.timestamp?.slice(0, 10) === date);
    const outTemp = filteredOutsideTemp.find(r => r.timestamp?.slice(0, 10) === date);
    const inHum = filteredInsideHum.find(r => r.timestamp?.slice(0, 10) === date);
    const outHum = filteredOutsideHum.find(r => r.timestamp?.slice(0, 10) === date);
    const power = filteredPower.find(r => r.timestamp?.slice(0, 10) === date);
    return {
      date,
      insideTemp: inTemp?.temperature ?? '-',
      outsideTemp: outTemp?.temperature ?? '-',
      insideHum: inHum?.humidity ?? '-',
      outsideHum: outHum?.humidity ?? '-',
      power: power?.consumption ?? '-',
    };
  });

  // Group by month for chart
  function groupByMonth(data, field) {
    const monthly = {};
    data.forEach(row => {
      if (!row.timestamp || typeof row[field] !== 'number') return;
      const key = getMonthKey(row.timestamp);
      if (!monthly[key]) monthly[key] = [];
      monthly[key].push(Number(row[field]));
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([key, vals]) => {
        const [year, month] = key.split("-");
        const label = `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`;
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return { key, label, avg: Number(avg.toFixed(2)) };
      });
  }

  // Combined chart data for temp/hum
  const months = Array.from(new Set([
    ...groupByMonth(filteredInsideTemp, 'temperature').map(r => r.label),
    ...groupByMonth(filteredOutsideTemp, 'temperature').map(r => r.label),
    ...groupByMonth(filteredInsideHum, 'humidity').map(r => r.label),
    ...groupByMonth(filteredOutsideHum, 'humidity').map(r => r.label),
  ]));

  const inTempMonthly = groupByMonth(filteredInsideTemp, 'temperature');
  const outTempMonthly = groupByMonth(filteredOutsideTemp, 'temperature');
  const inHumMonthly = groupByMonth(filteredInsideHum, 'humidity');
  const outHumMonthly = groupByMonth(filteredOutsideHum, 'humidity');

  function getMonthlyAvg(monthlyArr, label) {
    const found = monthlyArr.find(r => r.label === label);
    return found ? found.avg : null;
  }

  const tempHumChartData = {
    labels: months,
    datasets: [
      {
        label: "Inside Temperature (°C)",
        data: months.map(m => getMonthlyAvg(inTempMonthly, m)),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
      {
        label: "Outside Temperature (°C)",
        data: months.map(m => getMonthlyAvg(outTempMonthly, m)),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
      {
        label: "Inside Humidity (%)",
        data: months.map(m => getMonthlyAvg(inHumMonthly, m)),
        backgroundColor: "rgba(33, 150, 243, 0.7)",
        borderColor: "rgba(33, 150, 243, 1)",
        borderWidth: 2,
      },
      {
        label: "Outside Humidity (%)",
        data: months.map(m => getMonthlyAvg(outHumMonthly, m)),
        backgroundColor: "rgba(255, 206, 86, 0.7)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 2,
      },
    ]
  };

  // Power chart
  const powerMonthly = groupByMonth(filteredPower, 'consumption');
  const powerChartData = {
    labels: powerMonthly.map(r => r.label),
    datasets: [{
      label: "Avg Power Consumption (kWh)",
      data: powerMonthly.map(r => r.avg),
      backgroundColor: "rgba(255, 159, 64, 0.8)",
      borderColor: "rgba(255, 159, 64, 1)",
      borderWidth: 2,
    }]
  };

  // Chart options
  const chartOptions = (title, yLabel) => ({
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: title },
    },
    scales: {
      x: { title: { display: true, text: "Month" } },
      y: { title: { display: true, text: yLabel }, beginAtZero: true },
    },
  });

  // PDF Export Handler
  const handleSavePDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFontSize(12);
    pdf.text('Usage Data Table', 10, 10);

    // Prepare table headers and rows
    const headers = [
      'Date',
      'Inside Temp (°C)',
      'Outside Temp (°C)',
      'Inside Humidity (%)',
      'Outside Humidity (%)',
      'Power Consumption (kWh)'
    ];
    const rows = mergedRows.map(row => [
      row.date,
      row.insideTemp,
      row.outsideTemp,
      row.insideHum,
      row.outsideHum,
      row.power
    ]);

    // Add table using autoTable
    autoTable(pdf, {
      head: [headers],
      body: rows,
      startY: 16,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [33, 150, 243] }
    });

    // --- CHARTS ---
    let page = 1;
    if (selectedUsages.tempHum) {
      pdf.addPage();
      pdf.text('Temperature & Humidity Usage Chart', 10, 10);
      const chartCanvas = await html2canvas(chartRefs.tempHum.current);
      const chartImgData = chartCanvas.toDataURL('image/png');
      pdf.addImage(chartImgData, 'PNG', 10, 20, 190, 80);
      page++;
    }
    if (selectedUsages.power) {
      pdf.addPage();
      pdf.text('Power Consumption Usage Chart', 10, 10);
      const chartCanvas = await html2canvas(chartRefs.power.current);
      const chartImgData = chartCanvas.toDataURL('image/png');
      pdf.addImage(chartImgData, 'PNG', 10, 20, 190, 80);
      page++;
    }
    pdf.save('OptiCoolReport.pdf');
  };

  return (
    <>
      <div>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Export Usage PDF
        </Button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Export Usage PDF</DialogTitle>
        <DialogContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <label>Start Month: </label>
                <input
                  type="month"
                  value={startMonth}
                  onChange={e => setStartMonth(e.target.value)}
                />
                <label style={{ marginLeft: 8 }}>End Month: </label>
                <input
                  type="month"
                  value={endMonth}
                  onChange={e => setEndMonth(e.target.value)}
                />
              </div>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedUsages.tempHum}
                      onChange={e => setSelectedUsages(u => ({ ...u, tempHum: e.target.checked }))}
                    />
                  }
                  label="Temperature & Humidity"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedUsages.power}
                      onChange={e => setSelectedUsages(u => ({ ...u, power: e.target.checked }))}
                    />
                  }
                  label="Power Consumption"
                />
              </FormGroup>
              <Button
                variant="contained"
                color="primary"
                style={{ margin: "16px 0" }}
                onClick={handleSavePDF}
              >
                Save as PDF
              </Button>
              <div ref={tableRef} style={{ marginBottom: 32, overflowX: 'auto' }}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Inside Temperature (°C)</TableCell>
                        <TableCell>Outside Temprature (°C)</TableCell>
                        <TableCell>Inside Humidity (%)</TableCell>
                        <TableCell>Outside Humidity (%)</TableCell>
                        <TableCell>Power Consumption (kWh)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mergedRows.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.insideTemp}</TableCell>
                          <TableCell>{row.outsideTemp}</TableCell>
                          <TableCell>{row.insideHum}</TableCell>
                          <TableCell>{row.outsideHum}</TableCell>
                          <TableCell>{row.power}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              {selectedUsages.tempHum && (
                <div ref={chartRefs.tempHum} style={{ marginBottom: 32 }}>
                  <Typography variant="h6">Temperature & Humidity Usage Chart</Typography>
                  <Bar data={tempHumChartData} options={chartOptions("Monthly Avg Temp & Humidity", "Value")} />
                </div>
              )}
              {selectedUsages.power && (
                <div ref={chartRefs.power} style={{ marginBottom: 32 }}>
                  <Typography variant="h6">Power Consumption Usage Chart</Typography>
                  <Bar data={powerChartData} options={chartOptions("Monthly Avg Power Consumption", "Power Consumption (kWh)")} />
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}