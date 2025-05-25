import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardContainer.css";
import { FaUserCircle } from "react-icons/fa";

const ApplianceStatus = () => {


  const devices = [
    { name: "Aircon", icon: "❄️", color: "pink" },
    { name: "Fan", icon: "🌀", color: "blue" },
    { name: "Exhaust", icon: "🌫️", color: "blue" },
    { name: "Blower", icon: "💨", color: "pink" },
  ];

  return (
    <div className="dashboard-container">
  

      {/* Devices Section */}
      <div className="card">
        <h2 className="section-title">My Devices</h2>
        <div className="devices-grid">
          {devices.map((device, index) => (
            <div key={index} className={`device-card ${device.color}`}>
              <div className="device-icon">{device.icon}</div>
              <span className="device-name">{device.name}</span>
              <div className="toggle-switch">
                <div className="toggle-circle"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApplianceStatus;

