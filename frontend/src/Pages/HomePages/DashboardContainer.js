import { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardContainer.css";
import { FaUserCircle } from "react-icons/fa";
import dmtAPI from "../../dmtAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const DashboardContainer = () => {
  const [userList, setUserList] = useState([]);
  const token = localStorage.getItem("token");
  const [deviceStatus, setDeviceStatus] = useState({}); // Track on/off status
  const [currentACTemp, setCurrentACTemp] = useState("--"); // Add state for AC temp
  const [acInputTemp, setAcInputTemp] = useState(""); // State for input field
  const { user } = useSelector(state => state.auth);

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

    // Fetch current AC temp
    const fetchACTemp = async () => {
      try {
        const temp = await dmtAPI.getCurrentACTempAPI();
        setCurrentACTemp(temp);
      } catch (err) {
        setCurrentACTemp("--");
      }
    };

    fetchACTemp();
  }, []);

  const devices = [
    { name: "Aircon", icon: "❄️", color: "pink" },
    { name: "Fan", icon: "🌀", color: "blue" },
    { name: "Exhaust", icon: "🌫️", color: "blue" },
    { name: "Blower", icon: "💨", color: "pink" },
  ];

  // Log user action (copy from ManageRoom.js)
  const logUserAction = async (action) => {
    try {
      await axios.post(`${process.env.REACT_APP_API}/userlogs`, {
        user: user._id ? user._id : "Missing ID",
        action,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error logging user action:', error);
    }
  };

  // Handler for turning device on/off
  const handleDeviceAction = async (deviceName, action) => {
    try {
      if (deviceName === "Fan") {
        if (action === "on") {
          await dmtAPI.turnOnEFans();
        } else {
          await dmtAPI.turnOffEFans();
        }
      } else {
        await dmtAPI.turnOffDevice(deviceName);
      }
      setDeviceStatus((prev) => ({
        ...prev,
        [deviceName]: action === "on",
      }));
      toast.success(`${deviceName} turned ${action.toUpperCase()} successfully!`);
      logUserAction(`Turned ${action === "on" ? "On" : "Off"} ${deviceName}`);
    } catch (err) {
      toast.error(`Failed to turn ${action} ${deviceName}`);
    }
  };

  return (
    <div className="dashboard-container">
      <ToastContainer />
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
        {/* Show current AC temp and adjustment */}
        <div style={{ marginBottom: 12, fontWeight: "bold", display: "flex", alignItems: "center", gap: 16 }}>
          <span>
            Current AC Temp: <span style={{ color: "#1976d2" }}>{currentACTemp}°C</span>
          </span>
          <input
            type="number"
            min={16}
            max={30}
            placeholder="Set AC Temp"
            value={acInputTemp}
            onChange={e => setAcInputTemp(e.target.value)}
            style={{ width: 80, padding: "2px 6px", borderRadius: 4, border: "1px solid #ccc" }}
          />
          <button
            onClick={async () => {
              if (!acInputTemp) return;
              try {
                await dmtAPI.adjustACTempAPI(Number(acInputTemp));
                setCurrentACTemp(acInputTemp);
                alert(`AC temperature set to ${acInputTemp}°C`);
              } catch (err) {
                alert("Failed to adjust AC temperature");
              }
            }}
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "4px 12px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Set Temp
          </button>
        </div>
        {/* Add All On/Off Buttons */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <button
            onClick={async () => {
              try {
                await dmtAPI.turnOnAllAC();
                await dmtAPI.turnOnEFans();
                await dmtAPI.turnOnBlower && dmtAPI.turnOnBlower();
                await dmtAPI.turnOnExhaust && dmtAPI.turnOnExhaust();
                alert("All devices turned ON");
              } catch (err) {
                alert("Failed to turn all devices ON");
              }
            }}
            style={{
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "6px 18px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Turn All On
          </button>
          <button
            onClick={async () => {
              try {
                await dmtAPI.turnOffAllAC();
                await dmtAPI.turnOffEFans();
                await dmtAPI.turnOffBlower && dmtAPI.turnOffBlower();
                await dmtAPI.turnOffExhaust && dmtAPI.turnOffExhaust();
                alert("All devices turned OFF");
              } catch (err) {
                alert("Failed to turn all devices OFF");
              }
            }}
            style={{
              background: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "6px 18px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Turn All Off
          </button>
        </div>
        <div className="devices-grid">
          {devices.map((device, index) => (
            <div key={index} className={`device-card ${device.color}`}>
              <div className="device-icon">{device.icon}</div>
              <span className="device-name">{device.name}</span>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => handleDeviceAction(device.name, "on")}
                  style={{
                    background: "#4caf50",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "4px 12px",
                    cursor: "pointer",
                  }}
                >
                  Turn On
                </button>
                <button
                  onClick={() => handleDeviceAction(device.name, "off")}
                  style={{
                    background: "#f44336",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "4px 12px",
                    cursor: "pointer",
                  }}
                >
                  Turn Off
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;
