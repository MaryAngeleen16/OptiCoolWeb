import { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardContainer.css";
import { FaUserCircle } from "react-icons/fa";
import dmtAPI from "../../dmtAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import TemperatureControl from "./TemperatureControl";
import { useNavigate } from "react-router-dom";

const DashboardContainer = () => {
  const [userList, setUserList] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState({});
  const [currentACTemp, setCurrentACTemp] = useState("--");
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/users/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserList(data.users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    const fetchACTemp = async () => {
      try {
        const temp = await dmtAPI.getCurrentACTempAPI();
        setCurrentACTemp(temp);
      } catch (err) {
        setCurrentACTemp("--");
      }
    };

    fetchUsers();
    fetchACTemp();
  }, [token]);

  const logUserAction = async (action) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API}/activity-log`,
        {
          userId: user?._id ?? "Unknown",
          action,
          timestamp: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      toast.error("Error logging user action");
    }
  };

  const logApplianceAction = async (appliance, action) => {
    try {
      await axios.post(`${process.env.REACT_APP_API}/appliances`, {
        appliance,
        action,
        user: user?._id,
      });
    } catch (err) {
      console.error("Failed to log appliance action:", err);
    }
  };

  const handleTurnOffSystem = async () => {
    let success = false;
    try {
      await axios.post(`${process.env.REACT_APP_API}/proxy/stop`);
      toast.success("System turned off successfully");
      success = true;
    } catch (err) {
      toast.error(
        err?.response?.status === 404 || err.message === "Network Error"
          ? "System is not rendered properly, please turn it on first"
          : "Failed to turn off system"
      );
    } finally {
      logUserAction(`Turned Off System - ${success ? "Success" : "Failed"}`);
    }
  };

  const handleDeviceAction = async (deviceName, action) => {
    let success = false;
    try {
      if (deviceName === "Fan") {
        action === "on" ? await dmtAPI.turnOnEFans() : await dmtAPI.turnOffEFans();
      } else if (deviceName === "Aircon") {
        action === "on" ? await dmtAPI.turnOnAllAC() : await dmtAPI.turnOffAllAC();
      } else if (deviceName === "Blower") {
        action === "on" ? await dmtAPI.turnOnBlower?.() : await dmtAPI.turnOffBlower?.();
      } else if (deviceName === "Exhaust") {
        action === "on" ? await dmtAPI.turnOnExhaust?.() : await dmtAPI.turnOffExhaust?.();
      }

      setDeviceStatus((prev) => ({ ...prev, [deviceName]: action === "on" }));
      toast.success(`${deviceName} turned ${action.toUpperCase()} successfully!`);
      success = true;
    } catch (err) {
      toast.error(
        err?.response?.status === 404 || err.message === "Network Error"
          ? "System is not rendered properly please turn it on"
          : `Failed to turn ${action} ${deviceName}`
      );
    } finally {
      logUserAction(
        `Toggled ${deviceName} ${action.charAt(0).toUpperCase() + action.slice(1)} - ${
          success ? "Success" : "Failed"
        }`
      );

      if (success) {
        await logApplianceAction(deviceName, action);
      }
    }
  };

  const devices = [
    { name: "Aircon", icon: "❄️", color: "yellow"},
    { name: "Fan", icon: "🌀", color: "blue" },
    { name: "Exhaust", icon: "🌫️", color: "blue" },
    { name: "Blower", icon: "💨", color: "yellow" },
  ];

  return (
    <div className="dashboard-container">
      <div className="card">
        <h2 className="section-title">Users</h2>
        <div className="members-list">
          {userList.map((user, index) => (
            <div key={index} className="member">
              <FaUserCircle className="icon blue" />
              <span className={`member-name ${user.color || "default"}`}>{user.username}</span>
            </div>
          ))}
        </div>
      </div>

            <button
        onClick={() => navigate("/reportpage")}
        style={{
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          padding: "10px 18px",
          fontWeight: "bold",
          marginTop: "20px",
          cursor: "pointer",
        }}
      >
        Send Report
      </button>

      <div className="card">
        <div className="section-title-container">
          <h2 className="section-title">My Devices</h2>
          <button onClick={handleTurnOffSystem} className="black-button">
            TURN OFF SYSTEM
          </button>
        </div>

        <div className="temp-control">
          <span>
            Current AC Temp: <span className="temp-value">{currentACTemp}°C</span>
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
                toast.error("Failed to adjust AC temperature");
                logUserAction(`Changed Aircon Temperature to ${newTemp}°C - Failed`);
              }
            }}
          />
        </div>

        <div className="device-buttons" style={{ marginBottom: "20px", marginTop: "10px" }}>
          <button
            className="green-button"
            onClick={async () => {
              let success = false;
              try {
                await dmtAPI.turnOnAllAC();
                await dmtAPI.turnOnEFans();
                await dmtAPI.turnOnBlower?.();
                await dmtAPI.turnOnExhaust?.();
                toast.success("All devices turned ON");
                success = true;
              } catch (err) {
                toast.error("Failed to turn all devices ON");
              } finally {
                logUserAction(`Toggled All Devices On - ${success ? "Success" : "Failed"}`);
              }
            }}
          >
            Turn All On
          </button>

          <button
            className="red-button"
            onClick={async () => {
              let success = false;
              try {
                await dmtAPI.turnOffAllAC();
                await dmtAPI.turnOffEFans();
                await dmtAPI.turnOffBlower?.();
                await dmtAPI.turnOffExhaust?.();
                toast.success("All devices turned OFF");
                success = true;
              } catch (err) {
                toast.error("Failed to turn all devices OFF");
              } finally {
                logUserAction(`Toggled All Devices Off - ${success ? "Success" : "Failed"}`);
              }
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
              <div className="device-action-buttons">
                <button
                  className="green-button"
                  onClick={() => handleDeviceAction(device.name, "on")}
                >
                  Turn On
                </button>
                <button
                  className="red-button"
                  onClick={() => handleDeviceAction(device.name, "off")}
                >
                  Turn Off
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>


      <ToastContainer />
    </div>
  );
};

export default DashboardContainer;
