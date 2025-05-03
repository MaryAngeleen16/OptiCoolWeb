import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardContainer.css";
import { FaUserCircle } from "react-icons/fa";

const DashboardContainer = () => {
  const [userList, setUserList] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/users/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserList(data.users); // Set the user list from API response
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, []);

  const devices = [
    { name: "Aircon", icon: "❄️", color: "pink" },
    { name: "Fan", icon: "🌀", color: "blue" },
    { name: "Exhaust", icon: "🌫️", color: "blue" },
    { name: "Blower", icon: "💨", color: "pink" },
  ];

  return (
    <div className="dashboard-container">
      {/* User List Section */}
      <div className="card">
        <h2 className="section-title">Users</h2>
        <div className="members-list">
          {userList.map((user, index) => (
            <div key={index} className="member">
              <FaUserCircle className="icon blue" />
              <span className={`member-name ${user.color || "default"}`}>
                {user.username}
              </span>
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
