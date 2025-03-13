import React, { useState, useEffect } from "react";
import { FaThermometerHalf } from "react-icons/fa";
import axios from "axios";
import dmtUrl from "../../dmtURL";
import "./TemperatureDisplay.css";

const TemperatureDisplay = () => {
  const [indoorTemperature, setIndoorTemperature] = useState(null);
  const [outdoorTemperature, setOutdoorTemperature] = useState(21); // Placeholder value

  useEffect(() => {
    const fetchIndoorTemperature = async () => {
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

        if (data && data.inside && data.inside.temperature !== undefined) {
          setIndoorTemperature(data.inside.temperature);
        } else {
          throw new Error("Invalid JSON structure");
        }
      } catch (err) {
        console.error("Error fetching room temperature:", err.message);
        alert("Failed to fetch indoor temperature.");
      }
    };

    fetchIndoorTemperature();
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
          <FaThermometerHalf className="icon" />
        </div>
      </div>

      <div className="divider"></div>

      {/* Outdoor Temperature */}
      <div className="temperature-box">
        <div className="temperature-content">
          <div className="temp-info">
            <span className="label">Outdoor temperature</span>
            <span className="temp">{outdoorTemperature}°C</span>
          </div>
          <FaThermometerHalf className="icon" />
        </div>
      </div>
    </div>
  );
};

export default TemperatureDisplay;