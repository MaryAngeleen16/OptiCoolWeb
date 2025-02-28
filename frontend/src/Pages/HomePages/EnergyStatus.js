import React from "react";
import "./EnergyStatus.css"; // Create a CSS file for styling
import { FaBolt } from "react-icons/fa"; // Using FontAwesome for icons

const EnergyStatus = ({ date, location, temperature, wattsSaved, wattsUsed }) => {
  return (
    <div className="energy-status-card">
      <div className="header">
        <span className="date">{date}</span>
        <span className="location">{location}, {temperature}°C</span>
      </div>
      <p className="weather-info">It’s sunny today, make the most out of daylight. ☀️</p>
      <hr />
      <div className="energy-stats">
        <div className="saved">
          <FaBolt className="icon green" /> 
          <span className="text">{wattsSaved} watt saved</span>
        </div>
        <div className="used">
          <FaBolt className="icon red" /> 
          <span className="text">{wattsUsed} watt used</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyStatus;
