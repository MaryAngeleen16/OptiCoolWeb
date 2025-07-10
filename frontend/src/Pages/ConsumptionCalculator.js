import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../Components/Layouts/Sidebar';
// Helper to group by month and get average
function groupByMonthAverage(data) {
  const monthly = {};
  data.forEach(row => {
    const date = new Date(row.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!monthly[key]) monthly[key] = [];
    monthly[key].push(Number(row.consumption));
  });
  return Object.entries(monthly)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([key, vals]) => {
      let [year, month] = key.split("-");
      month = Number(month);
      const label = `${new Date(year, month - 1).toLocaleString("default", { month: "long" })} ${year}`;
      return { key, label, avg: Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) };
    });
}

const ConsumptionCalculator = () => {
  const today = new Date();
  const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
  const prevMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  const prevMonthName = new Date(prevMonthYear, prevMonth).toLocaleString('default', { month: 'long' });

  const [rate, setRate] = useState(() => {
    const saved = localStorage.getItem('meralco_rate');
    return saved ? parseFloat(saved) : 12.0;
  });
  const [editingRate, setEditingRate] = useState(false);

  const [prevMonthAvg, setPrevMonthAvg] = useState(null);
  const [manualKwh, setManualKwh] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API}/powerconsumptions`)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        const monthly = groupByMonthAverage(data);

        const prevMonthLabel = `${prevMonthName} ${prevMonthYear}`;
        const found = monthly.find(m => m.label === prevMonthLabel);
        setPrevMonthAvg(found ? found.avg : null);
      });
  }, [prevMonthName, prevMonthYear]);

  const saveRate = () => {
    localStorage.setItem('meralco_rate', rate);
    setEditingRate(false);
  };

  // Compute estimated bill for previous month
  const estimatedBill = prevMonthAvg !== null ? prevMonthAvg * rate : 0;
  const manualBill = manualKwh && !isNaN(manualKwh) ? parseFloat(manualKwh) * rate : 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      minHeight: '100vh',
      background: '#f7f7f7'
    }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '40px 10px',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 600, // was 420
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            padding: 24,
            margin: '0 auto'
          }}
        >
          <h2 style={{textAlign: 'center', marginBottom: 24}}>Monthly Power Consumption Calculator</h2>
          {prevMonthAvg !== null ? (
            <div style={{marginBottom: 16, color: '#1976d2', fontWeight: 600}}>
              {prevMonthName} {prevMonthYear} Average Consumption: <span style={{color: '#222'}}>{prevMonthAvg} kWh</span>
            </div>
          ) : (
            <div style={{marginBottom: 16}}>Loading previous month's average consumption...</div>
          )}
          <div style={{marginBottom: 16}}>
            <label style={{fontWeight: 'bold'}}>Meralco kWh rate:&nbsp;</label>
            {editingRate ? (
              <>
                <input
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={e => setRate(e.target.value)}
                  style={{width: 80, textAlign: 'center'}}
                />
                <button onClick={saveRate} style={{marginLeft: 8}}>Save</button>
                <button onClick={() => setEditingRate(false)} style={{marginLeft: 4}}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{fontSize: 18, color: '#1976d2'}}>{rate} PHP/kWh</span>
                <button onClick={() => setEditingRate(true)} style={{marginLeft: 8}}>Edit</button>
              </>
            )}
          </div>
          <div style={{marginTop: 16}}>
            <div>
              <b>Estimated {prevMonthName} Bill Based On Previous Data:</b>{" "}
              <span style={{color: '#222'}}>
                {prevMonthAvg !== null
                  ? estimatedBill.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
                  : "--"}{" "}
                PHP
              </span>
            </div>
          </div>
          <div style={{marginTop: 32, borderTop: '1px solid #eee', paddingTop: 24}}>
            <div style={{marginBottom: 12, color: '#1976d2', fontWeight: 600}}>Estimated Bill Using Manually Inputted Data</div>
            <div style={{marginBottom: 12}}>
              <label style={{fontWeight: 'bold'}}>Enter kWh:&nbsp;</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={manualKwh}
                onChange={e => setManualKwh(e.target.value)}
                style={{width: 100, textAlign: 'center'}}
                placeholder="e.g. 150"
              />
            </div>
            <div>
              <b>Estimated Bill:</b>{" "}
              <span style={{color: '#222'}}>
                {manualKwh && !isNaN(manualKwh)
                  ? manualBill.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
                  : "--"}{" "}
                PHP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionCalculator;