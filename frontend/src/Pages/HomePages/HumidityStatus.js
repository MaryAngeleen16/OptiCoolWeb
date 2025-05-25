import React, { useState, useEffect } from "react";
import { FaTint, FaThermometerHalf, FaCloudSun } from "react-icons/fa";
import axios from "axios";
import "./HumidityStatus.css";

const HumidityStatus = () => {
  const [humidity, setHumidity] = useState(null);
  const [feelsLike, setFeelsLike] = useState();
  const [weatherCondition, setWeatherCondition] = useState(null);
  const [lastRequestTime, setLastRequestTime] = useState(null);

const AccuweatherbaseURL = process.env.REACT_APP_ACCUWEATHER_BASE_URL;
        const apiKey = process.env.REACT_APP_ACCUWEATHER_API_KEY;
        const locationKey = process.env.REACT_APP_ACCUWEATHER_LOCATION_KEY; 

  useEffect(() => {
    const fetchWeatherData = async () => {
      const currentTime = Date.now();
      if (lastRequestTime && currentTime - lastRequestTime < 30 * 60 * 1000) {
        console.log("API call frequency limit reached. Try again after 30 minutes.");
        return;
      }

      try {
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
          const weather = data[0];
          setHumidity(weather.RelativeHumidity || "--");
          setFeelsLike(weather.RealFeelTemperature?.Metric?.Value || "---");
          setWeatherCondition(weather.WeatherText || "---");
          setLastRequestTime(currentTime);
        } else {
          console.error("No weather data returned.");
        }
      } catch (error) {
        console.error("Error fetching weather data:", error.message);
      }
    };

    fetchWeatherData();
  }, [lastRequestTime]);

  return (
    <div className="humidity-container">
      {/* Humidity */}
      <div className="humidity-box">
        <div className="weather-info">
          <span className="label">Humidity</span>
          <span className="value">{humidity}%</span>
        </div>
        <FaTint className="icon blue" />
      </div>

      <div className="divider"></div>

      {/* Feels Like */}
      <div className="humidity-box">
        <div className="weather-info">
          <span className="label">Feels Like</span>
          <span className="value">{feelsLike}°C</span>
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
