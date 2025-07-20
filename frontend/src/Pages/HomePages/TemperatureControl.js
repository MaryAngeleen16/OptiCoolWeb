import React, { useState, useEffect } from 'react';
import dmtAPI from '../../dmtAPI';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './TemperatureControl.css';


export default function TemperatureControl({ minTemp = 19, maxTemp = 25 }) {
  const [acTemp, setAcTemp] = useState(maxTemp);
  const [loading, setLoading] = useState(false);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchTemp = async () => {
      try {
        const temp = await dmtAPI.getCurrentACTempAPI();
        const safeTemp = Math.max(minTemp, Math.min(maxTemp, Number(temp)));
        setAcTemp(safeTemp);
      } catch (err) {
        console.error('Failed to fetch current AC temp:', err);
      }
    };
    fetchTemp();
  }, [minTemp, maxTemp]);

  const logUserAction = async (action) => {
    try {
      await axios.post(`${process.env.REACT_APP_API}/activity-log`, {
        userId: user?._id ?? "Unknown",
        action,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      toast.error('Error logging user action');
      console.error('Error logging user action:', error);
    }
  };

  const handleChangeTemp = async (direction) => {
    if (loading) return;

    const nextTemp = direction === "up" ? acTemp + 1 : acTemp - 1;

    if (nextTemp > maxTemp || nextTemp < minTemp) return;

    setLoading(true);
    try {
      await dmtAPI.adjustACFunc(direction, 1);
      setAcTemp(nextTemp);
      await logUserAction(`Adjusted AC temperature to ${direction === 'up' ? 'Up' : 'Down'} to ${nextTemp}°C`);
    } catch (err) {
      console.error('Failed to adjust AC temp:', err);
      toast.error("Failed to update temperature.");
      await logUserAction(`Attempted to adjust AC Temp ${direction === 'up' ? 'Up' : 'Down'} to ${nextTemp}°C - Failed`);
    }
    setLoading(false);
  };

  const handleIncrease = () => {
    if (acTemp >= maxTemp) {
      toast.warn(`Maximum temperature is ${maxTemp}°C`);
      return;
    }
    handleChangeTemp("up");
  };

  const handleDecrease = () => {
    if (acTemp <= minTemp) {
      toast.warn(`Minimum temperature is ${minTemp}°C`);
      return;
    }
    handleChangeTemp("down");
  };

  return (
    <div>
      <button className="button-cont" onClick={handleDecrease} disabled={loading || acTemp <= minTemp}>-</button>
      <span className="ac-temp-display">{acTemp}°C</span>
      <button className="button-cont" onClick={handleIncrease} disabled={loading || acTemp >= maxTemp}>+</button>
      {loading && <span style={{ marginLeft: 10 }}>Updating...</span>}
    </div>
  );
}
