import React from "react";
import { FaThermometerHalf } from "react-icons/fa";
import "./TemperatureDisplay.css"; // Add styles if needed

const TemperatureDisplay = () => {
  // Mock data for temperatures
  const indoorTemperature = 24;
  const outdoorTemperature = 21;

  return (
    <div className="temperature-container">
      <div className="temperature-box">
        <span className="label">Indoor temperature</span>
        <FaThermometerHalf className="icon" />
        <span className="temp">{indoorTemperature}°C</span>
      </div>
      <div className="divider"></div>
      <div className="temperature-box">
        <span className="label">Outdoor temperature</span>
        <FaThermometerHalf className="icon" />
        <span className="temp">{outdoorTemperature}°C</span>
      </div>
    </div>
  );
};

export default TemperatureDisplay;
