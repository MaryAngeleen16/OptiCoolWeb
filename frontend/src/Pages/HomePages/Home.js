import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";
import cloudIcon from "../../Icons/CLOUD.png";
import sunIcon from "../../Icons/SUN.png";
import partlySunnyIcon from "../../Icons/PARTLYSUNNY.png";
import rainIcon from "../../Icons/RAIN.png";
import windIcon from "../../Icons/WIND.png";
import thurderstormIcon from "../../Icons/THUNDERSTORM.png";
import overcastIcon from "../../Icons/OVERCAST.png";
import wIcon from "../../Icons/UMBRELLA.png";
import Sidebar from "../../Components/Layouts/Sidebar";
import { useNavigate } from "react-router-dom";
import dmtAPI from "../../dmtAPI";
import Header from "../../Components/Layouts/Header";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EnergyStatus from "./EnergyStatus";
import TemperatureDisplay from "./TemperatureDisplay";
import HumidityStatus from "./HumidityStatus";
import DashboardContainer from "./DashboardContainer";

function Home() {
  // AccuWeather API Constants
  const AccuweatherbaseURL = "https://dataservice.accuweather.com";
  const apiKey = "I8m0OklfM6lIEJGIAl7Sa96aZSGY6Enm";
  const locationKey = "759349";

  // State Variables
  const [powerConsumption, setPowerConsumption] = useState(null);
  const [insideTemp, setInsideTemp] = useState(null);
  const [outsideTemp, setOutsideTemp] = useState(null);
  const [outsideHumidity, setOutsideHumidity] = useState(null);
  const [insideHumidity, setInsideHumidity] = useState(null);
  const [acTemp, setAcTemp] = useState(null);
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

  // Fetch Device Data
  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const devicesData = await dmtAPI.getDevicesDataAPI();
        setInsideTemp(devicesData.inside.temperature);
        setInsideHumidity(devicesData.inside.humidity);
        setOutsideTemp(devicesData.outside.temperature);
        setOutsideHumidity(devicesData.outside.humidity);
        setPowerConsumption(devicesData.power.consumption);
      } catch (error) {
        console.error("Error fetching device data:", error);
        setInsideTemp("N/A");
        setInsideHumidity("N/A");
        setOutsideTemp("N/A");
        setOutsideHumidity("N/A");
        setPowerConsumption("N/A");
      }
    };

    fetchDeviceData();
  }, []);

  // Fetch AC Temperature
  useEffect(() => {
    const fetchAcTemp = async () => {
      try {
        const acTempData = await dmtAPI.getCurrentACTempAPI();
        setAcTemp(acTempData.temperature);
      } catch (error) {
        console.error("Error fetching AC temperature:", error);
        setAcTemp("N/A");
      }
    };

    fetchAcTemp();
  }, []);

  // Fetch Weather Data
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
          params: { apikey: apiKey, language: "en-us", details: true },
        }
      );

      if (data && data.length > 0) {
        setWeatherData(data[0]);
        setLastRequestTime(currentTime);
      } else {
        console.error("No weather data returned.");
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setIsRequesting(false);
    }
  };

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
          <AccountCircleIcon
            style={{ color: "#2F80ED", fontSize: 50, marginTop: -10 }}
          />
        </div>
      </div>

      <div className="first-row">
        <div className="status-container">
          <EnergyStatus />
          <TemperatureDisplay />
          <HumidityStatus />
          <DashboardContainer />
        </div>
        <div className="vertical-box">
          <h3>Additional Info</h3>
          <p>Some relevant details...</p>
        </div>
      </div>

      <Sidebar />

      <div className="accuweather-container">
        <div className="accuweather glass-epek">
          <div className="temp-container">
            <span className="temp-des">
              {weatherData?.Temperature?.Metric?.Value || "--"}
            </span>
            <span className="temp-unit">°C</span>
          </div>

          <span className="accu-loc">TAGUIG</span>

          <div className="accu-text1">
            {weatherData?.WeatherText?.toUpperCase() || "---"}
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
    </div>
  );
}

export default Home;
