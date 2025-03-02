import React from "react";
import { FaThermometerHalf } from "react-icons/fa";
import "./TemperatureDisplay.css";

const TemperatureDisplay = () => {
  const indoorTemperature = 24;
  const outdoorTemperature = 21;

  return (
    <div className="temperature-container">
      {/* Indoor Temperature */}
      <div className="temperature-box">
        <div className="temperature-content">
          <div className="temp-info">
            <span className="label">Indoor temperature</span>
            <span className="temp">{indoorTemperature}°C</span>
          </div>
          <FaThermometerHalf className="icon" />
        </div>
      </div>

      <div className="divider"></div>

      {/* Outdoor Temperature */}
      <div className="temperature-box">
        <div className="temperature-content">
          <div className="temp-info">
            <span className="label">Outdoor temperature</span>
            <span className="temp">{outdoorTemperature}°C</span>
          </div>
          <FaThermometerHalf className="icon" />
        </div>
      </div>
    </div>
  );
};

export default TemperatureDisplay;
