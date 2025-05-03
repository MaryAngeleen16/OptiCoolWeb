import React, { useState, useEffect } from "react";
import "./EnergyStatus.css";
import { FaBolt } from "react-icons/fa";
import axios from "axios";

const EnergyStatus = ({ wattsUsed }) => {
  const [date, setDate] = useState("");
  const [temperature, setTemperature] = useState("--");

  useEffect(() => {
    // Update date every day
    const today = new Date();
    setDate(`${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`);

    // Fetch temperature from WeatherApp.js logic
    const fetchTemperature = async () => {
      try {
        const AccuweatherbaseURL = "http://dataservice.accuweather.com";
        const apiKey = "I8m0OklfM6lIEJGIAl7Sa96aZSGY6Enm";
        const locationKey = "759349";

        const { data } = await axios.get(
          `${AccuweatherbaseURL}/currentconditions/v1/${locationKey}`,
          {
            params: {
              apikey: apiKey,
              language: "en-us",
              details: true,
            },
          }
        );

        if (data && data.length > 0) {
          setTemperature(data[0].Temperature.Metric.Value || "--");
        } else {
          console.error("No temperature data returned.");
        }
      } catch (error) {
        console.error("Error fetching temperature:", error.message);
      }
    };

    fetchTemperature();
  }, []);

  return (
    <div className="energy-status-card">
      <div className="header">
        <span className="date"><b>{temperature}°C</b></span>
        <span className="location">{date}</span>
        <span className="location">Taguig, Philippines</span>
      </div>
      <hr />
      <div className="energy-stats">
        <div className="used">
          <FaBolt className="icon red" />
          <span className="text">{wattsUsed} watt used</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyStatus;
