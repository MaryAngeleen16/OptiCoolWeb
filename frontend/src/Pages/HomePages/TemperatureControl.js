import React, { useState, useEffect } from 'react';
import dmtAPI from '../../dmtAPI';
import { toast } from 'react-toastify';

export default function TemperatureControl({ minTemp = 19, maxTemp = 25 }) {
  const [acTemp, setAcTemp] = useState(maxTemp);
  const [loading, setLoading] = useState(false);

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

  const handleChangeTemp = async (direction) => {
    if (loading) return;

    const nextTemp = direction === "up" ? acTemp + 1 : acTemp - 1;

    if (nextTemp > maxTemp || nextTemp < minTemp) return;

    setLoading(true);
    try {
      await dmtAPI.adjustACFunc(direction, 1); // ✅ send "up" or "down"
      setAcTemp(nextTemp); // optimistic update
    } catch (err) {
      console.error('Failed to adjust AC temp:', err);
      toast.error("Failed to update temperature.");
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
      <button onClick={handleDecrease} disabled={loading || acTemp <= minTemp}>-</button>
      <span style={{ margin: '0 10px' }}>{acTemp}°C</span>
      <button onClick={handleIncrease} disabled={loading || acTemp >= maxTemp}>+</button>
      {loading && <span style={{ marginLeft: 10 }}>Updating...</span>}
    </div>
  );
}
