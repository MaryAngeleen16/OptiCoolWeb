import React, { useState, useEffect } from 'react';
import dmtAPI from '../../dmtAPI';

export default function TemperatureControl({ minTemp = 16, maxTemp = 30 }) {
  const [acTemp, setAcTemp] = useState(25);
  const [loading, setLoading] = useState(false);

  // Fetch current AC temp on mount
  useEffect(() => {
    const fetchTemp = async () => {
      try {
        const temp = await dmtAPI.getCurrentACTempAPI();
        setAcTemp(Number(temp));
      } catch (err) {
        console.error('Failed to fetch current AC temp:', err);
      }
    };
    fetchTemp();
  }, []);

  const handleChangeTemp = async (direction) => {
    setLoading(true);
    try {
      await dmtAPI.adjustACTempAPI(direction);
      setAcTemp(prev => direction === "up" ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Failed to adjust AC temp:', err);
    }
    setLoading(false);
  };

  const handleIncrease = () => {
    if (acTemp < maxTemp) {
      handleChangeTemp("up");
    }
  };

  const handleDecrease = () => {
    if (acTemp > minTemp) {
      handleChangeTemp("down");
    }
  };

  return (
    <div>
      <button onClick={handleDecrease} disabled={acTemp <= minTemp || loading}>-</button>
      <span style={{ margin: '0 10px' }}>{acTemp}°C</span>
      <button onClick={handleIncrease} disabled={acTemp >= maxTemp || loading}>+</button>
      {loading && <span style={{ marginLeft: 10 }}>Updating...</span>}
    </div>
  );
}