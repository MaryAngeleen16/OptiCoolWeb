import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
// import Header from "./Components/Layouts/Header";
import "./Components/Layouts/Home.css";
import cloudIcon from "./Icons/CLOUD.png";
import sunIcon from "./Icons/SUN.png";
import partlySunnyIcon from "./Icons/PARTLYSUNNY.png";
import rainIcon from "./Icons/RAIN.png";
import windIcon from "./Icons/WIND.png";
import thurderstormIcon from "./Icons/THUNDERSTORM.png";
import overcastIcon from "./Icons/OVERCAST.png";
import wIcon from "./Icons/UMBRELLA.png";
import Sidebar from "./Components/Layouts/Sidebar";
import { useNavigate } from "react-router-dom";
import UserDashboard from "./Dashboard/UserDashboard";

function Home() {
  // AccuWeather API Constants
  const AccuweatherbaseURL = "http://dataservice.accuweather.com";
  const apiKey = "I8m0OklfM6lIEJGIAl7Sa96aZSGY6Enm";
  const locationKey = "759349";
  const ESP32_IP = "http://192.168.0.102";
  const [insideHumidity, setInsideHumidity] = useState(null);
  const [outsideHumidity, setOutsideHumidity] = useState(null);
  const [insideTemperature, setInsideTemperature] = useState(null);
  const [outsideTemperature, setOutsideTemperature] = useState(null);
  const [powerConsumption, setPowerConsumption] = useState(null);

  const fetchTemperatureData = async () => {
    try {
      const tempResponse = await axios.get(`${ESP32_IP}/temperature`);
      setInsideTemperature(tempResponse.data.insideTemp || "--");
      setOutsideTemperature(tempResponse.data.outsideTemp || "--");
    } catch (error) {
      console.error("Error fetching temperature data from ESP32:", error);
    }
  };

  // Fetch humidity data from ESP32 (humidity endpoint)
  const fetchHumidityData = async () => {
    try {
      const humidityResponse = await axios.get(`${ESP32_IP}/humidity`);
      setInsideHumidity(humidityResponse.data.insideHumidity || "--");
      setOutsideHumidity(humidityResponse.data.outsideHumidity || "--");
    } catch (error) {
      console.error("Error fetching humidity data from ESP32:", error);
    }
  };

  // Fetch power consumption data
  const fetchPowerConsumption = async () => {
    try {
      const response = await axios.get(`${ESP32_IP}/power_consumption_data`);
      setPowerConsumption(response.data || []);
    } catch (error) {
      console.error("Error fetching power consumption data:", error);
    }
  };

  // State Variables
  const [weatherData, setWeatherData] = useState(null);
  const [lastRequestTime, setLastRequestTime] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isOnline, setIsOnline] = useState(null);
  const navigate = useNavigate();

  // Weather icon mapping
  const weatherIconMap = {
    "Sunny": sunIcon,
    "Partly sunny": partlySunnyIcon,
    "Mostly cloudy": cloudIcon,
    "Partly cloudy": cloudIcon,
    "Cloudy": cloudIcon,
    "Overcast": overcastIcon,
    "Rainy": rainIcon,
    "Windy": windIcon,
    "Thunderstorms": thurderstormIcon,
  };

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
    fetchTemperatureData(); // Fetch temperature data from ESP32
    fetchHumidityData(); // Fetch humidity data from ESP32
  }, []);

  useEffect(() => {
    setTimeout(() => setIsOnline(true), 3000);
  }, []);

  return (
    <div className="homebody" style={{ display: 'flex' }}>
      <Sidebar />
      <UserDashboard />
      <div style={{ flex: 1, marginLeft: '80px' }}> {/* Adjust margin to match sidebar width */}
        {/* Environment Status */}
        <div className="envstatus-container">
          <div className="envstatus glass-epek">
            {/* <div className="envstatus"> */}
            <div className="envstatus-row">
              {/* Inside Humidity */}
              <div className="envstatus-item">
                <span className="envstatus-label">Inside Humidity</span>
                <span className="envstatus-value">
                  {insideHumidity !== null ? `${insideHumidity}%` : "--"}
                </span>
              </div>

              {/* Energy Consumption */}
              <div className="envstatus-item">
                <span className="envstatus-label">Energy Consumption</span>
                <span className="envstatus-value">
                {powerConsumption !== null ? `${powerConsumption}kWh` : "--"}
                </span>
              </div>

              {/* Inside Temperature */}
              <div className="envstatus-item">
                <span className="envstatus-label">Inside Temperature</span>
                <span className="envstatus-value">
                  {insideTemperature !== null ? `${insideTemperature}°C` : "--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Accuweather Container */}
        <div className="accuweather-container">
          <div className="accuweather glass-epek">
            {/* Weather Data */}
            {/* <div className="weather-icon">{getWeatherIcon(weatherData?.WeatherText)}</div>            */}
            <div
              className={`weather-icon ${
                weatherData?.WeatherText === "Partly cloudy"
                  ? "partly-cloudy"
                  : weatherData?.WeatherText === "Sunny"
                  ? "sunny"
                  : weatherData?.WeatherText === "Partly sunny"
                  ? "partly-sunny"
                  : weatherData?.WeatherText === "Mostly cloudy"
                  ? "partly-cloudy"
                  : weatherData?.WeatherText === "Cloudy"
                  ? "partly-cloudy"
                  : weatherData?.WeatherText === "Rainy"
                  ? "rainy"
                  : weatherData?.WeatherText === "Windy"
                  ? "windy"
                  : weatherData?.WeatherText === "Thunderstorms"
                  ? "thunderstorm"
                  : weatherData?.WeatherText === "Overcast"
                  ? "overcast"
                  : "umbrella"
              }`}
            >
              <img
                src={weatherIconMap[weatherData?.WeatherText] || wIcon}
                alt={weatherData?.WeatherText}
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "20px",
                }}
              />
            </div>

            <div style={{ textAlign: "right" }}>
              <div className="temp-container">
                <span className="temp-des">
                  {weatherData?.Temperature?.Metric?.Value || "--"}
                </span>
                <span className="temp-unit">°C</span>
              </div>

              <span className="accu-loc">TAGUIG</span>

              {/* <div>{weatherData?.WeatherText?.toUpperCase() || "---"}</div> */}
              <div className="accu-text1">
                {/* {weatherData?.RelativeHumidity}% */}
                {weatherData?.WeatherText?.toUpperCase() || "---"}{" "}
              </div>

              <div className="accu-text2">
                FEELS LIKE:{" "}
                {weatherData?.RealFeelTemperature?.Metric?.Value || "--"}°C
              </div>

              <button
                className="weather-btn"
                onClick={() => navigate("/manageRoom")}
              >
                MANAGE THE ROOM
              </button>
            </div>
          </div>

          {/* Box Container */}
          <div className="box-container glass-epek">
            <div className="box1">
              <div className="envstatus-row">
                {/* AC */}
                <div className="envstatus-item">
                  <span className="box-label">Airconditioners</span>
                  <span
                    className={`box-value ${
                      isOnline === null
                        ? "default"
                        : isOnline
                        ? "online"
                        : "offline"
                    }`}
                  >
                    {isOnline === null ? "---" : isOnline ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>
              </div>
            </div>

            <div className="box2">
              {/* FANS */}
              <div className="envstatus-row">
                <div className="envstatus-item">
                  <span className="box-label">Fans</span>
                  <span
                    className={`box-value ${
                      isOnline === null
                        ? "default"
                        : isOnline
                        ? "online"
                        : "offline"
                    }`}
                  >
                    {isOnline === null ? "---" : isOnline ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extras */}
        <div className="envstatus-container-2">
          <div className="envstatus glass-epek">
            {/* Your content for envstatus goes here */}

            <div className="envstatus-row">
              {/* Inside Humidity */}
              <div className="envstatus-item">
                <span className="envstatus-label">Outside Humidity</span>
                <span className="envstatus-value">
                  {outsideHumidity !== null ? `${outsideHumidity}%` : "--"}
                </span>
              </div>

              {/* Outside Temperature */}
              <div className="envstatus-item">
                <span className="envstatus-label">Outside Temperature</span>
                <span className="envstatus-value">
                  {outsideTemperature !== null ? `${outsideTemperature}°C` : "--"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
