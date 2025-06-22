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

  const handleChangeTemp = async (newTemp) => {
    setLoading(true);
    try {
      await dmtAPI.adjustACTempAPI(newTemp);
      setAcTemp(newTemp);
    } catch (err) {
      console.error('Failed to adjust AC temp:', err);
    }
    setLoading(false);
  };

  const handleIncrease = () => {
    if (acTemp < maxTemp) {
      handleChangeTemp(acTemp + 1);
    }
  };

  const handleDecrease = () => {
    if (acTemp > minTemp) {
      handleChangeTemp(acTemp - 1);
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