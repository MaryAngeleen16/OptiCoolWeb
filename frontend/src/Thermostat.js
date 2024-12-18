import React, { useState } from 'react';
import './Thermostat.css';

function Thermostat() {
  const [temperature, setTemperature] = useState(19); // Example temperature (in °C)

  const radius = 70; // Radius of the circle (half the size)
  const width = 250; // Width of the SVG to make it bigger
  const height = 150; // Height of the SVG to maintain proportion
  const circumference = Math.PI * radius; // Half circumference of the circle (only the top part)
  const maxProgressAngle = 90; // Max angle of the half circle (from 180° to 90°)
  
  // Calculate progress based on the temperature, ensuring 10% of the top half circle at 19°C
  const progressAngle = ((temperature - 19) / (28 - 19)) * maxProgressAngle; // This will calculate the angle from 0 to 90°

  // Function to increase the temperature
  const increaseTemperature = () => {
    setTemperature((prevTemp) => Math.min(prevTemp + 1, 28)); // Limit to 28°C
  };

  // Function to decrease the temperature
  const decreaseTemperature = () => {
    setTemperature((prevTemp) => Math.max(prevTemp - 1, 19)); // Limit to 19°C
  };

  // Convert progress angle to a stroke-dashoffset value
  const strokeDashoffset = circumference - (circumference * (progressAngle / maxProgressAngle));

  return (
    <div className="thermostat-container">
      <svg width={width} height={height} viewBox="0 0 250 150">
        <circle
          className="circle-background"
          cx="125"
          cy="125"
          r={radius}
          stroke="#ffffff" // White outline
          strokeWidth="10"
          fill="none"
        />
        <circle
          className="circle-progress"
          cx="125"
          cy="125"
          r={radius}
          stroke="#007bff" // Blue progress color
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference} // Half circumference for half circle
          strokeDashoffset={strokeDashoffset} // Adjust the progress based on calculated value
          transform="rotate(180, 125, 125)" // Rotate the circle to start from the bottom (180°)
        />
      </svg>

      {/* Temperature Display */}
      <div className="temperature-display">
        <span>{temperature}°C</span>
      </div>

      {/* Temperature Adjust Buttons */}
      <div className="temperature-adjust">
        <button className="adjust-button minus" onClick={decreaseTemperature}>
          -
        </button>
        <button className="adjust-button add" onClick={increaseTemperature}>
          +
        </button>
      </div>
    </div>
  );
}

export default Thermostat;
