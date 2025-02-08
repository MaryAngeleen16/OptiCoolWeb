import React, { useState, useEffect } from "react";
import Header from "./Components/Layouts/Header";
import "./ManageRoom.css";
import dmtAPI from "./dmtAPI";
import "./manage.css";

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

  useEffect(() => {
    localStorage.setItem("isOn", JSON.stringify(isOn));
    localStorage.setItem("mode", mode);
    localStorage.setItem("deviceStates", JSON.stringify(deviceStates));
    localStorage.setItem("acTemp", JSON.stringify(acTemp));
  }, [isOn, mode, deviceStates, acTemp]);

  // Toggle Power
  const togglePower = () => {
    setIsOn((prevState) => {
      const newState = !prevState;
      if (!newState) {
        setMode("auto");
        setDeviceStates({ ac: false, fan: false, blower: false, exhaustFan: false });
        setAcTemp(25);
      }
      return newState;
    });
  };

  // Toggle Mode
  const toggleMode = (newMode) => {
    if (isOn) setMode(newMode);
  };

  // Toggle Device with API Calls
  const toggleDevice = async (device) => {
    try {
      let updatedState = !deviceStates[device];
      if (device === "ac") updatedState ? await dmtAPI.turnOnAllAC() : await dmtAPI.turnOffAllAC();
      if (device === "fan") updatedState ? await dmtAPI.turnOnEFans() : await dmtAPI.turnOffEFans();
      if (device === "blower") updatedState ? await dmtAPI.turnOnBlower() : await dmtAPI.turnOffBlower();
      if (device === "exhaustFan") updatedState ? await dmtAPI.turnOnExhaust() : await dmtAPI.turnOffExhaust();
      
      setDeviceStates((prevState) => ({ ...prevState, [device]: updatedState }));
    } catch (error) {
      console.error(`Error toggling ${device}:`, error);
      alert(`Failed to toggle ${device}.`);
    }
  };

  // Adjust AC Temperature
  const changeACTemp = async (value) => {
    const newTemp = acTemp + value;
    if (newTemp >= 19 && newTemp <= 28) {
      try {
        await dmtAPI.setAcTemperature(newTemp);
        setAcTemp(newTemp);
      } catch (error) {
        console.error("Error adjusting AC temperature:", error);
        alert("Failed to adjust AC temperature.");
      }
    }
  };

  // Report Issue (Placeholder)
  const reportIssue = (device) => {
    alert(`Reported issue for ${device}`);
  };

  return (
    <div className="manage-room-container">
      <Header />
      <div className="power-control">
        <button onClick={togglePower}>{isOn ? "Turn Off" : "Turn On"}</button>
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
            <button className={mode === "auto" ? "active" : "inactive"} onClick={() => toggleMode("auto")}>
              Auto Mode
            </button>
            <button className={mode === "manual" ? "active" : "inactive"} onClick={() => toggleMode("manual")}>
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
            <button onClick={() => toggleDevice("ac")} className="AC-Fan-Button">
              {deviceStates.ac ? "Off" : "On"}
            </button>
            <button className="report-button" onClick={() => reportIssue("Air Conditioner")}>
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
              <button onClick={() => changeACTemp(-1)} disabled={acTemp <= 16}>-</button>
              <button onClick={() => changeACTemp(1)} disabled={acTemp >= 30}>+</button>
            </div>
          </div>

          {/* Fan Controls */}
          <div className="device-row">
            <label>FAN</label>
            <button onClick={() => toggleDevice("fan")} className="AC-Fan-Button">
              {deviceStates.fan ? "Off" : "On"}
            </button>
            <button className="report-button" onClick={() => reportIssue("Fan")}>
              Report
            </button>
          </div>

          {/* Blower Controls */}
          <div className="device-row">
            <label>BLOWER</label>
            <button onClick={() => toggleDevice("blower")} className="AC-Fan-Button">
              {deviceStates.blower ? "Off" : "On"}
            </button>
            <button className="report-button" onClick={() => reportIssue("Blower")}>
              Report
            </button>
          </div>

          {/* Exhaust Fan Controls */}
          <div className="device-row">
            <label>EXHAUST FAN</label>
            <button onClick={() => toggleDevice("exhaustFan")} className="AC-Fan-Button">
              {deviceStates.exhaustFan ? "Off" : "On"}
            </button>
            <button className="report-button" onClick={() => reportIssue("Exhaust Fan")}>
              Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageRoom;
