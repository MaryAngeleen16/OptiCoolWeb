import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
// import Header from "./Components/Layouts/Header";
import "./Home.css";
import cloudIcon from "../../Icons/CLOUD.png"; // Corrected path
import sunIcon from "../../Icons/SUN.png";
import partlySunnyIcon from "../../Icons/PARTLYSUNNY.png";
import rainIcon from "../../Icons/RAIN.png";
import windIcon from "../../Icons/WIND.png";
import thurderstormIcon from "../../Icons/THUNDERSTORM.png";
import overcastIcon from "../../Icons/OVERCAST.png";
import wIcon from "../../Icons/UMBRELLA.png";
import Sidebar from "../../Components/Layouts/Sidebar";
import { useNavigate } from "react-router-dom";
import UserDashboard from "../../Dashboard/UserDashboard";
import dmtAPI from "../../dmtAPI";
import Header from "../../Components/Layouts/Header";
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EnergyStatus from "./EnergyStatus";
import TemperatureDisplay from "./TemperatureDisplay";

function Home() {
  // AccuWeather API Constants
  const AccuweatherbaseURL = "https://dataservice.accuweather.com";
  const apiKey = "I8m0OklfM6lIEJGIAl7Sa96aZSGY6Enm";
  const locationKey = "759349";

  // const [insideTemperature, setInsideTemperature] = useState(null);
  // const [outsideTemperature, setOutsideTemperature] = useState(null);
  const [powerConsumption, setPowerConsumption] = useState(null);
  const [insideTemp, setInsideTemp] = useState(null);
  const [outsideTemp, setOutsideTemp] = useState(null);
  const [outsideHumidity, setOutsideHumidity] = useState(null); // State for humidity
  const [insideHumidity, setInsideHumidity] = useState(null); // State for inside humidity
  const [acTemp, setAcTemp] = useState(null); // State for AC temperature

  useEffect(() => {
    const fetchOutsideData = async () => {
      try {
        const devicesData = await dmtAPI.getDevicesDataAPI();

        setOutsideTemp(devicesData.outside.temperature); // Set outside temp
        setOutsideHumidity(devicesData.outside.humidity); // Set outside humidity
      } catch (error) {
        console.error("Error fetching outside data:", error);
        setOutsideTemp("N/A");
        setOutsideHumidity("N/A");
      }
    };

    fetchOutsideData();
  }, []);

  useEffect(() => {
    const fetchInsideData = async () => {
      try {
        const devicesData = await dmtAPI.getDevicesDataAPI();

        setInsideTemp(devicesData.inside.temperature); // Set inside temp
        setInsideHumidity(devicesData.inside.humidity); // Set inside humidity
        setPowerConsumption(devicesData.power.consumption); // Fetch power consumption
      } catch (error) {
        console.error("Error fetching inside data:", error);
        setInsideTemp("N/A");
        setInsideHumidity("N/A");
        setPowerConsumption("N/A");
      }
    };

    fetchInsideData();
  }, []);

  useEffect(() => {
    const fetchAcTemp = async () => {
      try {
        const acTempData = await dmtAPI.getCurrentACTempAPI();
        setAcTemp(acTempData.temperature); // Set AC temperature
      } catch (error) {
        console.error("Error fetching AC temperature:", error);
        setAcTemp("N/A");
      }
    };

    fetchAcTemp();
  }, []);

  // State Variables
  const [weatherData, setWeatherData] = useState(null);
  const [lastRequestTime, setLastRequestTime] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isOnline, setIsOnline] = useState(null);
  const navigate = useNavigate();

  // Weather icon mapping
  const weatherIconMap = {
    Sunny: sunIcon,
    "Partly sunny": partlySunnyIcon,
    "Mostly cloudy": cloudIcon,
    "Partly cloudy": cloudIcon,
    Cloudy: cloudIcon,
    Overcast: overcastIcon,
    Rainy: rainIcon,
    Windy: windIcon,
    Thunderstorms: thurderstormIcon,
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
  }, []);

  useEffect(() => {
    setTimeout(() => setIsOnline(true), 3000);
  }, []);

  return (
    <div className="homebody">
      <div className="header-container">
        <div className="header-left">
          <h1>Hello, Nick!</h1>
          <p>Welcome home!</p>
        </div>
        <div className="header-center">
          <input type="text" placeholder="Search" className="search-input" />
        </div>
        <div className="header-right">
          <NotificationsIcon style={{ color: "#2F80ED", fontSize: 30 }} />
          <SettingsIcon style={{ color: "#2F80ED", fontSize: 30 }} />
          <AccountCircleIcon style={{ color: "#2F80ED", fontSize: 50, marginTop: -10 }} /> {/* Make avatar icon bigger */}
        </div>
      </div>

      <div className="first-row">
        <EnergyStatus />
        <TemperatureDisplay />
      </div>

      {/* Commenting out visuals */}
      {/* <div className="svg-waves"></div>
      <div className="svg-waves2"></div> */}
      {/* <Header /> */}
      <Sidebar />
      {/* <UserDashboard /> */}
      <div style={{ flex: 1, marginLeft: "80px" }}>
        {" "}
        {/* Adjust margin to match sidebar width */}
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
                  {powerConsumption !== null ? `${powerConsumption} kW` : "---"}
                </span>
              </div>

              {/* Inside Temperature */}
              <div className="envstatus-item">
                <span className="envstatus-label">Inside Temperature</span>
                <span className="envstatus-value">
                  {insideTemp !== null ? `${insideTemp}°C` : "---"}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Accuweather Container */}
        <div className="accuweather-container">
          <div className="accuweather glass-epek">
            {/* Weather Data */}
            {/* Commenting out visuals */}
            {/* <div
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
            </div> */}

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
                    className="envstatus-value"
                    style={{ fontSize: "2rem", fontWeight: "bold" }}
                  >
                    {acTemp !== null ? `${acTemp}°C` : "---"}
                  </span>
                </div>
              </div>
            </div>

            <div className="box2">
              {/* FANS */}
              {/* <div className="envstatus-row">
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
              </div> */}
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
                  {insideHumidity !== null ? `${insideHumidity}%` : "---"}
                </span>
              </div>

              {/* Outside Temperature */}
              <div className="envstatus-item">
                <span className="envstatus-label">Outside Temperature</span>
                <span className="envstatus-value">
                  {outsideTemp !== null ? `${outsideTemp}°C` : "---"}
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
