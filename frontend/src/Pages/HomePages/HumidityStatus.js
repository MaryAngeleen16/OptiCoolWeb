import React from "react";
import { FaTint, FaThermometerHalf, FaCloudSun } from "react-icons/fa";
import "./HumidityStatus.css";

const HumidityStatus = () => {
  const humidity = "65%";
  const feelsLike = "27°C";
  const weatherCondition = "Sunny";

  return (
    <div className="humidity-container">
      {/* Humidity */}
      <div className="humidity-box">
        <div className="weather-info">
          <span className="label">Humidity</span>
          <span className="value">{humidity}</span>
        </div>
        <FaTint className="icon blue" />
      </div>

      <div className="divider"></div>

      {/* Feels Like */}
      <div className="humidity-box">
        <div className="weather-info">
          <span className="label">Feels Like</span>
          <span className="value">{feelsLike}</span>
        </div>
        <FaThermometerHalf className="icon red" />
      </div>

      <div className="divider"></div>

      {/* Weather Condition */}
      <div className="humidity-box">
        <div className="weather-info">
          <span className="label">Weather</span>
          <span className="value">{weatherCondition}</span>
        </div>
        <FaCloudSun className="icon yellow" />
      </div>
    </div>
  );
};

export default HumidityStatus;
