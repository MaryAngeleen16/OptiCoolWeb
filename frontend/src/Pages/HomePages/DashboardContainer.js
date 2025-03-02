import React from "react";
import "./DashboardContainer.css";

const DashboardContainer = () => {
  const members = [
    { name: "Alex", color: "pink" },
    { name: "Jhon", color: "blue" },
    { name: "Alisha", color: "pink" },
    { name: "Piter", color: "yellow" },
    { name: "Rachel", color: "pink" },
  ];

  const devices = [
    { name: "Aircon", icon: "❄️", color: "pink" },
    { name: "Fan", icon: "🌀", color: "blue" },
    { name: "Exhaust", icon: "💡", color: "blue" },
    { name: "Blower", icon: "🎵", color: "pink" },
  ];

  return (
    <div className="dashboard-container">
      {/* Members Section */}
      <div className="card">
        <h2 className="section-title">Members</h2>
        <div className="members-list">
          {members.map((member, index) => (
            <div key={index} className="member">
              <div className="avatar"></div>
              <span className={`member-name ${member.color}`}>{member.name}</span>
            </div>
          ))}
        </div>
      </div>

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

export default DashboardContainer;
