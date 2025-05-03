import React, { useState, useEffect } from "react";
import { FaThermometerHalf } from "react-icons/fa";
import axios from "axios";
import dmtUrl from "../../dmtURL";
import "./TemperatureDisplay.css";

const TemperatureDisplay = () => {
  const [indoorTemperature, setIndoorTemperature] = useState(null);
  const [outdoorTemperature, setOutdoorTemperature] = useState(null); // Placeholder value

  useEffect(() => {
    const fetchTemperatures = async () => {
      try {
        const response = await axios.get(`${dmtUrl}/devices_data`, {
          headers: { "Accept": "application/json" },
        });

        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received HTML instead of JSON. Ignoring response.");
        }

        const data = response.data; // Axios already parses JSON
        console.log("Fetched JSON data:", data);

        if (data) {
          if (data.inside && data.inside.temperature !== undefined) {
            setIndoorTemperature(data.inside.temperature);
          } else {
            console.warn("Invalid indoor temperature structure");
          }

          if (data.outside && data.outside.temperature !== undefined) {
            setOutdoorTemperature(data.outside.temperature);
          } else {
            console.warn("Invalid outdoor temperature structure");
          }
        } else {
          throw new Error("Invalid JSON structure");
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