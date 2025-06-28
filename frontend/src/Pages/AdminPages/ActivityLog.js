import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import moment from "moment-timezone";
import "./ActivityLog.css"; // You can use CSS Modules too if preferred

const ActivityLog = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivityLogs = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API}/activity-log?userId=${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setLogs(response.data.logs);
      } else {
        console.error("Failed to fetch logs:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  if (loading) {
    return (
      <div className="centered">
        <div className="spinner"></div>
        <p className="loading-text">Loading activity logs...</p>
      </div>
    );
  }

  return (
    <div className="log-container">
      <h2 className="log-title">Activity Log</h2>
      <div className="log-list">
        {logs.map((item) => (
          <div className="log-item" key={item._id}>
            <div className="left-section">
              <p className="username">{item.userId?.username || "Unknown User"}</p>
              <p className="action">{item.action}</p>
            </div>
            <div className="right-section">
              <p className="timestamp">
                {moment(item.timestamp).tz("Asia/Manila").format("hh:mm A")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;
