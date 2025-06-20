// import React, { useState, useEffect } from "react";
// import Header from "./Components/Layouts/Header";
// import "./ManageRoom.css";
// import dmtAPI from "./dmtAPI";
// import "./manage.css";
// import ReportForm from "./ReportForm"; // Import the new ReportForm component
// import axios from 'axios';
// import { useSelector } from 'react-redux'; // Import useSelector from react-redux

// function ManageRoom() {
//   const [isOn, setIsOn] = useState(() => JSON.parse(localStorage.getItem("isOn")) ?? false);
//   const [mode, setMode] = useState(() => localStorage.getItem("mode") ?? "auto");
//   const [deviceStates, setDeviceStates] = useState(() => JSON.parse(localStorage.getItem("deviceStates")) ?? {
//     ac: false,
//     fan: false,
//     blower: false,
//     exhaustFan: false,
//   });
//   const [acTemp, setAcTemp] = useState(() => JSON.parse(localStorage.getItem("acTemp")) ?? 25);
//   const [showReportForm, setShowReportForm] = useState(false);
//   const [reportDevice, setReportDevice] = useState("");

//   const { user, token } = useSelector(state => state.auth); // Get user and token from Redux store

//   const [toggleTimes, setToggleTimes] = useState([]);
//   const [isDisabled, setIsDisabled] = useState(() => {
//     const disableData = JSON.parse(localStorage.getItem("disableData"));
//     return disableData ? disableData.isDisabled : false;
//   });
//   const [disableTime, setDisableTime] = useState(() => {
//     const disableData = JSON.parse(localStorage.getItem("disableData"));
//     return disableData ? disableData.disableTime : 0;
//   });
//   const [showPopup, setShowPopup] = useState(false);

//   useEffect(() => {
//     localStorage.setItem("isOn", JSON.stringify(isOn));
//     localStorage.setItem("mode", mode);
//     localStorage.setItem("deviceStates", JSON.stringify(deviceStates));
//     localStorage.setItem("acTemp", JSON.stringify(acTemp));
//   }, [isOn, mode, deviceStates, acTemp]);

//   useEffect(() => {
//     if (isDisabled) {
//       const interval = setInterval(() => {
//         setDisableTime((prevTime) => {
//           const newTime = prevTime - 1;
//           if (newTime <= 0) {
//             clearInterval(interval);
//             setIsDisabled(false);
//             setShowPopup(false);
//             localStorage.removeItem("disableData");
//           } else {
//             localStorage.setItem("disableData", JSON.stringify({ isDisabled: true, disableTime: newTime }));
//           }
//           return newTime;
//         });
//       }, 1000);

//       return () => clearInterval(interval);
//     }
//   }, [isDisabled]);

//   const logUserAction = async (action) => {
//     try {
//       await axios.post(`${process.env.REACT_APP_API}/userlogs`, {
//         user: user._id ? user._id : "Missing ID",
//         action,
//         timestamp: new Date().toISOString(),
//       }, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//     } catch (error) {
//       console.error('Error logging user action:', error);
//     }
//   };

//   const handleDisableUser = () => {
//     setIsDisabled(true);
//     setDisableTime(300); // 5 minutes in seconds
//     setShowPopup(true);
//     localStorage.setItem("disableData", JSON.stringify({ isDisabled: true, disableTime: 300 }));
//   };

//   // Toggle Power
//   const togglePower = () => {
//     const now = Date.now();
//     setToggleTimes((prevTimes) => {
//       const newTimes = [...prevTimes, now].filter((time) => now - time <= 10000);
//       if (newTimes.length >= 4) {
//         handleDisableUser();
//       }
//       return newTimes;
//     });

//     if (!isDisabled) {
//       setIsOn((prevState) => {
//         const newState = !prevState;
//         logUserAction(`Turned ${newState ? 'On' : 'Off'} Power`);
//         if (!newState) {
//           setMode("auto");
//           setDeviceStates({ ac: false, fan: false, blower: false, exhaustFan: false });
//           setAcTemp(25);
//         }
//         return newState;
//       });
//     }
//   };

//   // Toggle Mode
//   const toggleMode = (newMode) => {
//     if (isOn) {
//       setMode(newMode);
//       logUserAction(`Switched to ${newMode} Mode`);
//     }
//   };

//   // Toggle Device with API Calls
//   const toggleDevice = async (device) => {
//     logUserAction(`Toggled ${device} ${!deviceStates[device] ? 'On' : 'Off'}`);
//     try {
//       let updatedState = !deviceStates[device];
//       if (device === "Air Conditioner") updatedState ? await dmtAPI.turnOnAllAC() : await dmtAPI.turnOffAllAC();
//       if (device === "Fan") updatedState ? await dmtAPI.turnOnEFans() : await dmtAPI.turnOffEFans();
//       if (device === "Blower") updatedState ? await dmtAPI.turnOnBlower() : await dmtAPI.turnOffBlower();
//       if (device === "ExhaustFan") updatedState ? await dmtAPI.turnOnExhaust() : await dmtAPI.turnOffExhaust();
      
//       setDeviceStates((prevState) => ({ ...prevState, [device]: updatedState }));
//     } catch (error) {
//       console.error(`Error toggling ${device}:`, error);
//       alert(`Failed to toggle ${device}.`);
//     }
//   };

//   // Adjust AC Temperature
//   const changeACTemp = async (value) => {
//     const newTemp = acTemp + value;
//     logUserAction(`Changed Air Condtioner's Temperature to ${newTemp}°C`);
//     if (newTemp >= 16 && newTemp <= 30) {
//       try {
//         await dmtAPI.setAcTemperature(newTemp);
//         setAcTemp(newTemp);
//       } catch (error) {
//         console.error("Error adjusting AC temperature:", error);
//         alert("Failed to adjust AC temperature.");
//       }
//     }
//   };

//   // Report Issue
//   const reportIssue = (device) => {
//     setReportDevice(device);
//     setShowReportForm(true);
//   };

//   return (
//     <div className="manage-room-container">
//       <Header />
//       {showPopup && (
//         <div className="popup">
//           <p>Woah there! Take it easy, don't stress the IoT!</p>
//           <p>You can use the manage room again in {disableTime} seconds.</p>
//         </div>
//       )}
//       <div className="power-control">
//         <button onClick={togglePower} disabled={isDisabled}>{isOn ? "Turn Off" : "Turn On"}</button>
//       </div>

//       {isOn && (
//         <div className="mode-control">
//           <p style={{ textAlign: "center", fontWeight: "bold" }}>
//             Current Mode:{" "}
//             <span style={{ fontWeight: "bold", textTransform: "uppercase", color: "red" }}>
//               {mode}
//             </span>
//           </p>
//           <div className="mode-buttons">
//             <button className={mode === "auto" ? "active" : "inactive"} onClick={() => toggleMode("auto")}>
//               Auto Mode
//             </button>
//             <button className={mode === "manual" ? "active" : "inactive"} onClick={() => toggleMode("manual")}>
//               Manual Mode
//             </button>
//           </div>
//         </div>
//       )}

//       {mode === "manual" && isOn && (
//         <div className="manual-controls-container">
//           {/* AC Controls */}
//           <div className="device-row">
//             <label>Air Conditioner</label>
//             <button onClick={() => toggleDevice("Air Conditioner")} className="AC-Fan-Button">
//               {deviceStates.ac ? "Off" : "On"}
//             </button>
//             <button className="report-button" onClick={() => reportIssue("Air Conditioner")}>
//               Report
//             </button>
//           </div>

//           {/* AC Temperature Controls */}
//           <div className="temperature-control">
//             <label style={{textTransform:"uppercase"}}>AC Temperature: 
//               <span style={{textTransform:"uppercase", fontWeight:"bold"
//                 , fontSize:"32px"
//               }}> {acTemp}°C</span></label>
//             <div>
//               <button onClick={() => changeACTemp(-1)} disabled={acTemp <= 16}>-</button>
//               <button onClick={() => changeACTemp(1)} disabled={acTemp >= 30}>+</button>
//             </div>
//           </div>

//           {/* Fan Controls */}
//           <div className="device-row">
//             <label>FAN</label>
//             <button onClick={() => toggleDevice("Fan")} className="AC-Fan-Button">
//               {deviceStates.fan ? "Off" : "On"}
//             </button>
//             <button className="report-button" onClick={() => reportIssue("Fan")}>
//               Report
//             </button>
//           </div>

//           {/* Blower Controls */}
//           <div className="device-row">
//             <label>BLOWER</label>
//             <button onClick={() => toggleDevice("Blower")} className="AC-Fan-Button">
//               {deviceStates.blower ? "Off" : "On"}
//             </button>
//             <button className="report-button" onClick={() => reportIssue("Blower")}>
//               Report
//             </button>
//           </div>

//           {/* Exhaust Fan Controls */}
//           <div className="device-row">
//             <label>EXHAUST FAN</label>
//             <button onClick={() => toggleDevice("Exhaust Fan")} className="AC-Fan-Button">
//               {deviceStates.exhaustFan ? "Off" : "On"}
//             </button>
//             <button className="report-button" onClick={() => reportIssue("Exhaust Fan")}>
//               Report
//             </button>
//           </div>
//         </div>
//       )}

//       {showReportForm && (
//         <ReportForm
//           device={reportDevice}
//           onClose={() => setShowReportForm(false)}
//         />
//       )}
//     </div>
//   );
// }

// export default ManageRoom;
