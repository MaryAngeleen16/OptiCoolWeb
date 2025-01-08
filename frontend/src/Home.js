import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "./Components/Layouts/Header";
import "./Home.css";

function Home() {
  // AccuWeather API Constants
  const AccuweatherbaseURL = "http://dataservice.accuweather.com";
  const apiKey = "I8m0OklfM6lIEJGIAl7Sa96aZSGY6Enm";
  const locationKey = "759349";

  // State Variables
  const [weatherData, setWeatherData] = useState(null);
  const [lastRequestTime, setLastRequestTime] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);

  // Fetch Weather Data Function
  const fetchWeatherData = async () => {
    const currentTime = Date.now();
    if (lastRequestTime && currentTime - lastRequestTime < 30 * 60 * 1000) {
      console.log(
        "API call frequency limit reached. Try again after 30 minutes."
      );
      return;
    }

    try {
      setIsRequesting(true);
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
        setWeatherData(data[0]);
        setLastRequestTime(currentTime);
      } else {
        console.error("No weather data returned.");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error(
            "Weather data not found. Please check the location key."
          );
        } else if (error.response.status === 503) {
          console.error("Service is temporarily unavailable.");
        } else {
          console.error("Error fetching weather data:", error.response.status);
        }
      } else {
        console.error("Network error or other issue:", error.message);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  // useEffect Hook for Initial Data Fetch
  useEffect(() => {
    fetchWeatherData();
  }, []); // Empty dependency array ensures it runs only on mount

  return (
    <div>
      <Header />

      {/* Environment Status */}
      <div className="envstatus-container">
        <div className="envstatus">
          <div className="envstatus-row">
            {/* Inside Humidity */}
            <div className="envstatus-item">
              <span className="envstatus-label">Inside Humidity</span>
              <span className="envstatus-value">
                {weatherData?.RelativeHumidity || "--"}%
              </span>
            </div>

            {/* Energy Consumption */}
            <div className="envstatus-item">
              <span className="envstatus-label">Energy Consumption</span>
              <span className="envstatus-value">60 KWH</span>
            </div>

            {/* Inside Temperature */}
            <div className="envstatus-item">
              <span className="envstatus-label">Inside Temperature</span>
              <span className="envstatus-value">
                {weatherData?.Temperature?.Metric?.Value || "--"}°C
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Accuweather Container */}
      <div className="accuweather-container">
        <div className="accuweather">
          {/* Weather Data */}
          <div>
            <span style={{ fontSize: "24px" }}>
              {weatherData?.Temperature?.Metric?.Value || "--"}°C
            </span>
            <div>Taguig City</div>
            <div>{weatherData?.WeatherText || "---"}</div>
            <div>Humidity: {weatherData?.RelativeHumidity}%</div>
            <div>
              Feels Like:{" "}
              {weatherData?.RealFeelTemperature?.Metric?.Value || "--"}°C
            </div>
          </div>
        </div>

        {/* Box Container */}
        <div className="box-container">
          <div className="box1">
            <div className="envstatus-row">
              {/* AC */}
              <div className="envstatus-item">
                <span className="box-label">Airconditioner</span>
                <span className="box-value">ONLINE</span>
              </div>
            </div>
          </div>

          <div className="box2">
            {/* FANS */}
            <div className="envstatus-row">
              <div className="envstatus-item">
                <span className="box-label">Fans</span>
                <span className="box-value">OFFLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extras */}
      <div className="envstatus-container">
        <div className="envstatus">
          {/* Your content for envstatus goes here */}

          <div className="envstatus-row">
            {/* Inside Humidity */}
            <div className="envstatus-item">
              <span className="envstatus-label">Outside Humidity</span>
              <span className="envstatus-value">
                {weatherData?.RelativeHumidity || "--"}%
              </span>
            </div>

            {/* Outside Temperature */}
            <div className="envstatus-item">
              <span className="envstatus-label">Outside Temperature</span>
              <span className="envstatus-value">32°C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
