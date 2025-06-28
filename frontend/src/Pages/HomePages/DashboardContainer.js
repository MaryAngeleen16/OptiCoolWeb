import { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardContainer.css";
import { FaUserCircle } from "react-icons/fa";
import dmtAPI from "../../dmtAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import TemperatureControl from "./TemperatureControl";

const DashboardContainer = () => {
  const [userList, setUserList] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState({});
  const [currentACTemp, setCurrentACTemp] = useState("--");
  const [acInputTemp, setAcInputTemp] = useState("");
  const { user, token } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/users/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserList(data.users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();

    const fetchACTemp = async () => {
      try {
        const temp = await dmtAPI.getCurrentACTempAPI();
        setCurrentACTemp(temp);
      } catch (err) {
        setCurrentACTemp("--");
      }
    };

    fetchACTemp();
  }, [token]);

  const logUserAction = async (action) => {
    try {
      await axios.post(`${process.env.REACT_APP_API}/activity-log`, {
        userId: user?._id ?? "Unknown",
        action,
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      toast.error('Error logging user action');
      console.error('Error logging user action:', error);
    }
  };

  const handleTurnOffSystem = async () => {
    let success = false;
    try {
      await axios.post(`${process.env.REACT_APP_API}/proxy/stop`);
      toast.success("System turned off successfully");
      success = true;
    } catch (err) {
      if (
        (err.response && err.response.status === 404) ||
        err.message === "Network Error"
      ) {
        toast.error("System is not rendered properly, please turn it on first");
      } else {
        toast.error("Failed to turn off system");
      }
    } finally {
      logUserAction(`Turned Off System - ${success ? "Success" : "Failed"}`);
    }
  };

  const handleDeviceAction = async (deviceName, action) => {
    let success = false;
    try {
      if (deviceName === "Fan") {
        if (action === "on") {
          await dmtAPI.turnOnEFans();
        } else {
          await dmtAPI.turnOffEFans();
        }
      } else if (deviceName === "Aircon") {
        if (action === "on") {
          await dmtAPI.turnOnAllAC();
        } else {
          await dmtAPI.turnOffAllAC();
        }
      } else if (deviceName === "Blower") {
        if (action === "on") {
          await dmtAPI.turnOnBlower && dmtAPI.turnOnBlower();
        } else {
          await dmtAPI.turnOffBlower && dmtAPI.turnOffBlower();
        }
      } else if (deviceName === "Exhaust") {
        if (action === "on") {
          await dmtAPI.turnOnExhaust && dmtAPI.turnOnExhaust();
        } else {
          await dmtAPI.turnOffExhaust && dmtAPI.turnOffExhaust();
        }
      }
      setDeviceStatus((prev) => ({
        ...prev,
        [deviceName]: action === "on",
      }));
      toast.success(`${deviceName} turned ${action.toUpperCase()} successfully!`);
      success = true;
    } catch (err) {
      if (
        (err.response && err.response.status === 404) ||
        err.message === "Network Error"
      ) {
        toast.error("System is not rendered properly please turn it on");
      } else {
        toast.error(`Failed to turn ${action} ${deviceName}`);
      }
    } finally {
      logUserAction(
        `Toggled ${deviceName} ${action.charAt(0).toUpperCase() + action.slice(1)} - ${success ? "Success" : "Failed"}`
      );
    }
  };

  const devices = [
    { name: "Aircon", icon: "❄️", color: "pink" },
    { name: "Fan", icon: "🌀", color: "blue" },
    { name: "Exhaust", icon: "🌫️", color: "blue" },
    { name: "Blower", icon: "💨", color: "pink" },
  ];

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="section-title">My Devices</h2>
          <button
            onClick={handleTurnOffSystem}
            style={{
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "6px 12px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            TURN OFF SYSTEM
          </button>
        </div>
        <div style={{ marginBottom: 12, fontWeight: "bold", display: "flex", alignItems: "center", gap: 16 }}>
          <span>
            Current AC Temp: <span style={{ color: "#1976d2" }}>{currentACTemp}°C</span>
          </span>
          <TemperatureControl
            initialTemp={Number(currentACTemp)}
            minTemp={16}
            maxTemp={30}
            onTempChange={async (newTemp) => {
              try {
                await dmtAPI.adjustACTempAPI(newTemp);
                setCurrentACTemp(newTemp);
                toast.success(`AC temperature set to ${newTemp}°C`);
                logUserAction(`Changed Aircon Temperature to ${newTemp}°C`);
              } catch (err) {
                if (
                  (err.response && err.response.status === 404) ||
                  err.message === "Network Error"
                ) {
                  toast.error("System is not rendered properly please turn it on");
                } else {
                  toast.error("Failed to adjust AC temperature");
                }
                logUserAction(`Changed Aircon Temperature to ${newTemp}°C - Failed`);
              }
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <button
            onClick={async () => {
              let success = false;
              try {
                await dmtAPI.turnOnAllAC();
                await dmtAPI.turnOnEFans();
                await dmtAPI.turnOnBlower && dmtAPI.turnOnBlower();
                await dmtAPI.turnOnExhaust && dmtAPI.turnOnExhaust();
                toast.success("All devices turned ON");
                success = true;
              } catch (err) {
                if (
                  (err.response && err.response.status === 404) ||
                  err.message === "Network Error"
                ) {
                  toast.error("System is not rendered properly please turn it on");
                } else {
                  toast.error("Failed to turn all devices ON");
                }
              } finally {
                logUserAction(`Toggled All Devices On - ${success ? "Success" : "Failed"}`);
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
              let success = false;
              try {
                await dmtAPI.turnOffAllAC();
                await dmtAPI.turnOffEFans();
                await dmtAPI.turnOffBlower && dmtAPI.turnOffBlower();
                await dmtAPI.turnOffExhaust && dmtAPI.turnOffExhaust();
                toast.success("All devices turned OFF");
                success = true;
              } catch (err) {
                if (
                  (err.response && err.response.status === 404) ||
                  err.message === "Network Error"
                ) {
                  toast.error("System is not rendered properly please turn it on");
                } else {
                  toast.error("Failed to turn all devices OFF");
                }
              } finally {
                logUserAction(`Toggled All Devices Off - ${success ? "Success" : "Failed"}`);
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
