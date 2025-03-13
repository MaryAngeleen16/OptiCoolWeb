import React, { useState, useEffect } from "react";
import Header from "./Components/Layouts/Header";
import "./ManageRoom.css";
import "./manage.css";
import ReportForm from "./ReportForm"; // Import the new ReportForm component
import axios from 'axios';
import { useSelector } from 'react-redux'; // Import useSelector from react-redux
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ManageRoom() {
  const [isOn, setIsOn] = useState(() => JSON.parse(localStorage.getItem("isOn")) ?? false);
  const [mode, setMode] = useState(() => localStorage.getItem("mode") ?? "auto");
  const [deviceStates, setDeviceStates] = useState(() => JSON.parse(localStorage.getItem("deviceStates")) ?? {
    ac: false,
    fan: false,
    blower: false,
    exhaustFan: false,
  });
  const [acTemp, setAcTemp] = useState(() => JSON.parse(localStorage.getItem("acTemp")) ?? 25);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportDevice, setReportDevice] = useState("");

  const { user, token } = useSelector(state => state.auth); // Get user and token from Redux store

  const [isDisabled, setIsDisabled] = useState(() => {
    const disableData = JSON.parse(localStorage.getItem("disableData"));
    return disableData ? disableData.isDisabled : false;
  });
  const [disableTime, setDisableTime] = useState(() => {
    const disableData = JSON.parse(localStorage.getItem("disableData"));
    return disableData ? disableData.disableTime : 0;
  });

  useEffect(() => {
    localStorage.setItem("isOn", JSON.stringify(isOn));
    localStorage.setItem("mode", mode);
    localStorage.setItem("deviceStates", JSON.stringify(deviceStates));
    localStorage.setItem("acTemp", JSON.stringify(acTemp));
  }, [isOn, mode, deviceStates, acTemp]);

  useEffect(() => {
    if (isDisabled) {
      const interval = setInterval(() => {
        setDisableTime((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            clearInterval(interval);
            setIsDisabled(false);
            localStorage.removeItem("disableData");
          } else {
            localStorage.setItem("disableData", JSON.stringify({ isDisabled: true, disableTime: newTime }));
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isDisabled]);

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

  const checkRapidToggling = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/loglist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const logs = response.data.logs;
      const userLogs = logs.filter(log => log.user._id === user._id && log.action.includes('Toggled'));
      const now = Date.now();
      const recentLogs = userLogs.filter(log => now - new Date(log.timestamp).getTime() <= 10000);

      if (recentLogs.length >= 4) {
        handleDisableUser();
      }
    } catch (error) {
      console.error('Error checking user logs:', error);
    }
  };

  const handleDisableUser = () => {
    console.log("User disabled due to rapid toggling");
    setIsDisabled(true);
    setDisableTime(300); // 5 minutes in seconds
    toast.warn("Woah there! Take it easy, don't stress the IoT! You can use the manage room again in 5 minutes.");
    localStorage.setItem("disableData", JSON.stringify({ isDisabled: true, disableTime: 300 }));
  };

  // Toggle Power
  const togglePower = async () => {
    if (isDisabled) {
      toast.warn("You are still prohibited from using the controls.");
      return;
    }

    await logUserAction(`Toggled Power ${isOn ? 'Off' : 'On'}`);
    await checkRapidToggling();

    if (!isDisabled) {
      setIsOn((prevState) => {
        const newState = !prevState;
        if (!newState) {
          setMode("auto");
          setDeviceStates({ ac: false, fan: false, blower: false, exhaustFan: false });
          setAcTemp(25);
        }
        return newState;
      });
    }
  };

  // Toggle Mode
  const toggleMode = (newMode) => {
    if (isDisabled) {
      toast.warn("You are still prohibited from using the controls.");
      return;
    }

    if (isOn) {
      setMode(newMode);
      logUserAction(`Switched to ${newMode} Mode`);
    }
  };

  // Toggle Device without API Calls
  const toggleDevice = async (device) => {
    if (isDisabled) {
      toast.warn("You are still prohibited from using the controls.");
      return;
    }

    await logUserAction(`Toggled ${device} ${!deviceStates[device] ? 'On' : 'Off'}`);
    await checkRapidToggling();

    if (!isDisabled) {
      let updatedState = !deviceStates[device];
      setDeviceStates((prevState) => ({ ...prevState, [device]: updatedState }));
    }
  };

  // Adjust AC Temperature
  const changeACTemp = async (value) => {
    if (isDisabled) {
      toast.warn("You are still prohibited from using the controls.");
      return;
    }

    const newTemp = acTemp + value;
    logUserAction(`Changed Air Condtioner's Temperature to ${newTemp}°C`);
    if (newTemp >= 16 && newTemp <= 30) {
      setAcTemp(newTemp);
    }
  };

  // Report Issue
  const reportIssue = (device) => {
    if (isDisabled) {
      toast.warn("You are still prohibited from using the controls.");
      return;
    }

    setReportDevice(device);
    setShowReportForm(true);
  };

  return (
    <div className="manage-room-container">
      <Header />
      <ToastContainer />
      {isDisabled && (
        <div className="disable-notification">
          <p>You can use the manage room again in {disableTime} seconds.</p>
        </div>
      )}
      <div className="power-control">
        <button onClick={togglePower} disabled={isDisabled}>{isOn ? "Turn Off" : "Turn On"}</button>
      </div>

      {isOn && (
        <div className="mode-control">
          <p style={{ textAlign: "center", fontWeight: "bold" }}>
            Current Mode:{" "}
            <span style={{ fontWeight: "bold", textTransform: "uppercase", color: "red" }}>
              {mode}
            </span>
          </p>
          <div className="mode-buttons">
            <button className={mode === "auto" ? "active" : "inactive"} onClick={() => toggleMode("auto")} disabled={isDisabled}>
              Auto Mode
            </button>
            <button className={mode === "manual" ? "active" : "inactive"} onClick={() => toggleMode("manual")} disabled={isDisabled}>
              Manual Mode
            </button>
          </div>
        </div>
      )}

      {mode === "manual" && isOn && (
        <div className="manual-controls-container">
          {/* AC Controls */}
          <div className="device-row">
            <label>Air Conditioner</label>
            <button onClick={() => toggleDevice("ac")} className="AC-Fan-Button" disabled={isDisabled}>
              {deviceStates.ac ? "Off" : "On"}
            </button>
            <button className="report-button" onClick={() => reportIssue("Air Conditioner")} disabled={isDisabled}>
              Report
            </button>
          </div>

          {/* AC Temperature Controls */}
          <div className="temperature-control">
            <label style={{textTransform:"uppercase"}}>AC Temperature: 
              <span style={{textTransform:"uppercase", fontWeight:"bold"
                , fontSize:"32px"
              }}> {acTemp}°C</span></label>
            <div>
              <button onClick={() => changeACTemp(-1)} disabled={acTemp <= 16 || isDisabled}>-</button>
              <button onClick={() => changeACTemp(1)} disabled={acTemp >= 30 || isDisabled}>+</button>
            </div>
          </div>

          {/* Fan Controls */}
          <div className="device-row">
            <label>FAN</label>
            <button onClick={() => toggleDevice("fan")} className="AC-Fan-Button" disabled={isDisabled}>
              {deviceStates.fan ? "Off" : "On"}
            </button>
            <button className="report-button" onClick={() => reportIssue("Fan")} disabled={isDisabled}>
              Report
            </button>
          </div>

          {/* Blower Controls */}
          <div className="device-row">
            <label>BLOWER</label>
            <button onClick={() => toggleDevice("blower")} className="AC-Fan-Button" disabled={isDisabled}>
              {deviceStates.blower ? "Off" : "On"}
            </button>
            <button className="report-button" onClick={() => reportIssue("Blower")} disabled={isDisabled}>
              Report
            </button>
          </div>

          {/* Exhaust Fan Controls */}
          <div className="device-row">
            <label>EXHAUST FAN</label>
            <button onClick={() => toggleDevice("exhaustFan")} className="AC-Fan-Button" disabled={isDisabled}>
              {deviceStates.exhaustFan ? "Off" : "On"}
            </button>
            <button className="report-button" onClick={() => reportIssue("Exhaust Fan")} disabled={isDisabled}>
              Report
            </button>
          </div>
        </div>
      )}

      {showReportForm && (
        <ReportForm
          device={reportDevice}
          onClose={() => setShowReportForm(false)}
        />
      )}
    </div>
  );
}

export default ManageRoom;