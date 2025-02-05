// import React, { useState } from 'react';
// import Header from './Components/Layouts/Header';
// import './ManageRoom.css';
// import Thermostat from './Thermostat';

// function ManageRoom() {
//   const [activeCategory, setActiveCategory] = useState('All');
//   const [isAuto, setIsAuto] = useState(false);

//   const allItems = [
//     { name: 'AC 1', status: 'Online' },
//     { name: 'AC 2', status: 'Offline' },
//     { name: 'EXHAUST FAN', status: 'Online' },
//     { name: 'BLOWER', status: 'Offline' },
//     { name: 'FAN 1', status: 'Online' },
//     { name: 'FAN 2', status: 'Online' },
//     { name: 'FAN 3', status: 'Offline' },
//     { name: 'FAN 4', status: 'Online' },
//     { name: 'TEMP N HUMID SENSOR (OUTSIDE)', status: 'Online' },
//     { name: 'TEMP N HUMID SENSOR (INSIDE)', status: 'Offline' },
//   ];

//   const filteredItems = () => {
//     if (activeCategory === 'Appliances') {
//       return allItems.filter(item => item.name.includes('AC') || item.name.includes('FAN') || item.name.includes('BLOWER'));
//     } else if (activeCategory === 'Sensors') {
//       return allItems.filter(item => item.name.includes('SENSOR'));
//     }
//     return allItems;
//   };

//   const handleReport = async (appliance, status) => {
//     try {
//       const response = await fetch(`${process.env.REACT_APP_API}/ereport`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ appliance, status }),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Server error: ${response.status} - ${errorText}`);
//       }

//       const data = await response.json();

//       if (data.success) {
//         alert('Report successfully submitted');
//       } else {
//         alert('Failed to submit report: ' + data.message);
//       }
//     } catch (error) {
//       console.error('Error submitting report:', error);
//       alert('An error occurred while submitting the report.');
//     }
// };

//   return (
//     <div>
//       <Header />

//       <div className="ac-container">
//         <div className="ac-status">
//           <div className="toggle-container">
//             <span className={`toggle-label ${!isAuto ? 'active' : ''}`}>Manual</span>
//             <label className="switch">
//               <input
//                 type="checkbox"
//                 checked={isAuto}
//                 onChange={() => setIsAuto(!isAuto)}
//               />
//               <span className="slider round"></span>
//             </label>
//             <span className={`toggle-label ${isAuto ? 'active' : ''}`}>Auto</span>
//           </div>

//           <div className="thermostats-container">
//             <Thermostat isAuto={isAuto} />
//           </div>
//         </div>
//       </div>

//       <div className="buttons-container">
//         <button
//           className={`buttons-style ${activeCategory === 'All' ? 'active' : ''}`}
//           onClick={() => setActiveCategory('All')}
//         >
//           All
//         </button>
//         <button
//           className={`buttons-style ${activeCategory === 'Appliances' ? 'active' : ''}`}
//           onClick={() => setActiveCategory('Appliances')}
//         >
//           Appliances
//         </button>
//         <button
//           className={`buttons-style ${activeCategory === 'Sensors' ? 'active' : ''}`}
//           onClick={() => setActiveCategory('Sensors')}
//         >
//           Sensors
//         </button>
//       </div>

//       <div className="table-container">
//         <div className="table-header">
//           <div className="column">Appliances</div>
//           <div className="column">Status</div>
//           <div className="column">Action</div>
//         </div>

//         {filteredItems().map((item, index) => (
//           <div key={index} className="table-row">
//             <div className="column">{item.name}</div>
//             <div className="column">{item.status}</div>
//             <div className="column">
//               {!isAuto && !item.name.includes('SENSOR') && (
//                 <>
//                   <button className="control-button on-button">On</button>
//                   <button className="control-button off-button">Off</button>
//                 </>
//               )}
//               <button className="report-button" onClick={() => handleReport(item.name, item.status)}>
//                 Report
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default ManageRoom;

import React, { useState, useEffect } from "react";
import Header from "./Components/Layouts/Header";
import "./ManageRoom.css";
import Thermostat from "./Thermostat";
import "./Components/Layouts/Home.css";

function ManageRoom() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isAuto, setIsAuto] = useState(false);
  const [isOn, setIsOn] = useState(false);
  const [deviceStatuses, setDeviceStatuses] = useState([]);

  const ESP32_IP = "http://192.168.0.102";

  const allItems = [
    { name: "AC 1", status: "Online" },
    { name: "AC 2", status: "Offline" },
    { name: "EXHAUST FAN", status: "Online" },
    { name: "BLOWER", status: "Offline" },
    { name: "FAN 1", status: "Online" },
    { name: "FAN 2", status: "Online" },
    { name: "FAN 3", status: "Offline" },
    { name: "FAN 4", status: "Online" },
    { name: "TEMP N HUMID SENSOR (OUTSIDE)", status: "Online" },
    { name: "TEMP N HUMID SENSOR (INSIDE)", status: "Offline" },
  ];

  const filteredItems = () => {
    if (activeCategory === "Appliances") {
      return deviceStatuses.filter(
        (item) =>
          item.name.includes("AC") ||
          item.name.includes("FAN") ||
          item.name.includes("BLOWER")
      );
    } else if (activeCategory === "Sensors") {
      return deviceStatuses.filter((item) => item.name.includes("SENSOR"));
    }
    return deviceStatuses;
  };

  const fetchDeviceStatus = async () => {
    try {
      const response = await fetch(`${ESP32_IP}/status`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      console.log("Fetched Status:", data);

      // Map all items, ensuring every device has a status (fallback to 'Offline' if missing)
      const updatedStatuses = allItems.map((item) => ({
        name: item.name,
        status: data[`${item.name.toLowerCase().replace(/ /g, "_")}_status`]
          ? "Online"
          : "Offline",
      }));

      setDeviceStatuses(updatedStatuses);
    } catch (error) {
      console.error("Error fetching device status:", error);

      // If fetching fails, retain existing statuses or fall back to default ones
      setDeviceStatuses(
        allItems.map((item) => ({
          name: item.name,
          status: "Offline",
        }))
      );
    }
  };

  // Fetch status when the component mounts
  useEffect(() => {
    fetchDeviceStatus();
    const interval = setInterval(fetchDeviceStatus, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleReport = async (appliance, status) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/ereport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appliance, status }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      alert(
        data.success
          ? "Report successfully submitted"
          : "Failed to submit report: " + data.message
      );
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An error occurred while submitting the report.");
    }
  };

  return (
    <div className="manageroombody bottomimage">
        <Header />

        <div className="ac-container">
          <div className="ac-status">
            <button
              className={`power-button ${isOn ? "on" : "off"}`}
              onClick={() => {
                setIsOn(!isOn);
                if (!isOn) setIsAuto(true);
              }}
              style={{
                backgroundColor: isOn ? "green" : "red",
                color: "white",
              }}
            >
              {isOn ? "Turn Off" : "Turn On"}
            </button>

            <div className="toggle-container">
              <button
                className={`mode-button ${!isAuto ? "active" : ""}`}
                onClick={() => setIsAuto(false)}
                disabled={!isOn}
                style={{
                  backgroundColor: isOn ? "" : "gray",
                  color: isOn ? "" : "white",
                }}
              >
                Manual
              </button>
              <button
                className={`mode-button ${isAuto ? "active" : ""}`}
                onClick={() => setIsAuto(true)}
                disabled={!isOn}
                style={{
                  backgroundColor: isOn ? "" : "gray",
                  color: isOn ? "" : "white",
                }}
              >
                Auto
              </button>
            </div>

            <div className="thermostats-container">
              <Thermostat isAuto={isAuto && isOn} disabled={!isOn} />
            </div>
          </div>
        </div>

        <div className="buttons-container">
          {["All", "Appliances", "Sensors"].map((category) => (
            <button
              key={category}
              className={`buttons-style ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="table-container">
          <div className="table-header">
            <div className="column">Appliances</div>
            <div className="column">Status</div>
            <div className="column">Action</div>
          </div>

          {filteredItems().map((item, index) => (
            <div key={index} className="table-row">
              <div className="column">{item.name}</div>
              <div className="column">{item.status}</div>
              <div className="column">
                {!isAuto && isOn && !item.name.includes("SENSOR") && (
                  <>
                    <button className="control-button on-button">On</button>
                    <button className="control-button off-button">Off</button>
                  </>
                )}
                <button
                  className="report-button"
                  onClick={() => handleReport(item.name, item.status)}
                >
                  Report
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* <div className="bottomimage">
        </div> */}
    </div>
  );
}

export default ManageRoom;
