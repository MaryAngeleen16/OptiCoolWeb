import React, { useState, useEffect } from "react";
import { FaThermometerHalf } from "react-icons/fa";
import dmtAPI from "../../dmtAPI";
import "./TemperatureDisplay.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TemperatureDisplay = () => {
  const [indoorTemperature, setIndoorTemperature] = useState(null);
  const [outdoorTemperature, setOutdoorTemperature] = useState(null);
  const [indoorHumidity, setIndoorHumidity] = useState(null);
  const [outdoorHumidity, setOutdoorHumidity] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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
        if (devicesData && devicesData.inside && devicesData.inside.humidity !== undefined) {
          setIndoorHumidity(devicesData.inside.humidity);
        } else {
          setIndoorHumidity(null);
          console.warn("Invalid inside humidity structure");
        }
        if (devicesData && devicesData.outside && devicesData.outside.humidity !== undefined) {
          setOutdoorHumidity(devicesData.outside.humidity);
        } else {
          setOutdoorHumidity(null);
          console.warn("Invalid outside humidity structure");
        }
      } catch (err) {
        console.error("Error fetching temperatures/humidity:", err.message);
        toast.error("Failed to fetch temperatures/humidity.");
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <ToastContainer />
      <div className="temperature-container">
        {/* Indoor Temperature */}
        <div className="temperature-box">
          <div className="temperature-content">
            <div className="temp-info">
              <span className="label">Indoor temperature</span>
              <span className="temp">{indoorTemperature !== null ? `${indoorTemperature}°C` : "---°C"}</span>
            </div>
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
          </div>
        </div>
      </div>

      <div className="temperature-container" style={{ marginTop: 24 }}>
        {/* Indoor Humidity */}
        <div className="temperature-box">
          <div className="temperature-content">
            <div className="temp-info">
              <span className="label">Indoor humidity</span>
              <span className="temp">{indoorHumidity !== null ? `${indoorHumidity}%` : "---%"}</span>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        {/* Outdoor Humidity */}
        <div className="temperature-box">
          <div className="temperature-content">
            <div className="temp-info">
              <span className="label">Outdoor humidity</span>
              <span className="temp">{outdoorHumidity !== null ? `${outdoorHumidity}%` : "---%"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureDisplay;