import React, { useState } from 'react';
import './Thermostat.css';

function Thermostat({ isAuto }) {
  const [temperature, setTemperature] = useState(19); // Initial temperature in °C
  const radius = 70; // Circle radius
  const width = 250; // SVG width
  const height = 150; // SVG height
  const circumference = Math.PI * radius; // Half-circle circumference
  const maxProgressAngle = 90; // Max angle for the half-circle progress

  // Calculate progress angle based on temperature range
  const progressAngle = ((temperature - 19) / (28 - 19)) * maxProgressAngle;

  // Calculate stroke-dashoffset for the progress bar
  const strokeDashoffset =
    circumference - (circumference * progressAngle) / maxProgressAngle;

  // Increase temperature, limit to 28°C
  const increaseTemperature = () =>
    setTemperature((prevTemp) => Math.min(prevTemp + 1, 28));

  // Decrease temperature, limit to 19°C
  const decreaseTemperature = () =>
    setTemperature((prevTemp) => Math.max(prevTemp - 1, 19));

  return (
    <div className="thermostat-container">
      <svg width={width} height={height} viewBox="0 0 250 150">
        <circle
          className="circle-background"
          cx="125"
          cy="125"
          r={radius}
          strokeWidth="10"
          fill="none"
        />
        <circle
          className="circle-progress"
          cx="125"
          cy="125"
          r={radius}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(180, 125, 125)" // Rotate circle to start at bottom
        />
      </svg>

      <div className="temperature-display">{temperature}°C</div>

      <div className="temperature-adjust">
        <button
          className="adjust-button minus"
          onClick={decreaseTemperature}
          disabled={isAuto} // Disable in Auto mode
        >
          -
        </button>
        <button
          className="adjust-button add"
          onClick={increaseTemperature}
          disabled={isAuto} // Disable in Auto mode
        >
          +
        </button>
      </div>
    </div>
  );
}

export default Thermostat;
