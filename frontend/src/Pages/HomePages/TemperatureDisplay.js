import React, { useState, useEffect } from "react";
import { FaThermometerHalf } from "react-icons/fa";
import dmtAPI from "../../dmtAPI";
import "./TemperatureDisplay.css";

const TemperatureDisplay = () => {
  const [indoorTemperature, setIndoorTemperature] = useState(null);
  const [outdoorTemperature, setOutdoorTemperature] = useState(null);

  useEffect(() => {
    const fetchTemperatures = async () => {
      try {
        // Use the same logic as the dashboard: fetch from dmtAPI
        const devicesData = await dmtAPI.getDevicesDataAPI();
        if (devicesData && devicesData.inside && devicesData.inside.temperature !== undefined) {
          setIndoorTemperature(devicesData.inside.temperature);
        } else {
          setIndoorTemperature(null);
          console.warn("Invalid inside temperature structure");
        }
        if (devicesData && devicesData.outside && devicesData.outside.temperature !== undefined) {
          setOutdoorTemperature(devicesData.outside.temperature);
        } else {
          setOutdoorTemperature(null);
          console.warn("Invalid outside temperature structure");
        }
      } catch (err) {
        console.error("Error fetching temperatures:", err.message);
        alert("Failed to fetch temperatures.");
      }
    };

    fetchTemperatures();
  }, []);

  return (
    <div className="temperature-container">
      {/* Indoor Temperature */}
      <div className="temperature-box">
        <div className="temperature-content">
          <div className="temp-info">
            <span className="label">Indoor temperature</span>
            <span className="temp">{indoorTemperature !== null ? `${indoorTemperature}°C` : "---°C"}</span>
          </div>
          {/* <FaThermometerHalf className="icon" /> */}
        </div>
      </div>

      <div className="divider"></div>

      {/* Outdoor Temperature */}
      <div className="temperature-box">
        <div className="temperature-content">
          <div className="temp-info">
            <span className="label">Outdoor temperature</span>
            <span className="temp">{outdoorTemperature !== null ? `${outdoorTemperature}°C` : "---°C"}</span>
          </div>
          {/* <FaThermometerHalf className="icon" /> */}
        </div>
      </div>
    </div>
  );
};

export default TemperatureDisplay;