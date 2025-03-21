import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./Dashboard.css";
import Header from "../Components/Layouts/Header";
import HumidityUsage from "./HumidityUsage";
import TemperatureUsage from "./TemperatureUsage";
import UsageTracking from "../Pages/HomePages/UsageTracking";
import "./StylesUsage.css";
import Sidebar from "../Components/Layouts/Sidebar";

const Dashb = () => {
  return (
    <div style={styles.dashboardContainer}>
      <Header />
      {/* <Sidebar /> */}
      <div style={styles.content}>
        Dashboard
        <div style={styles.chartContainer}>
          <HumidityUsage />
          <TemperatureUsage />
          <UsageTracking />
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: {
    display: "flex",
    flexDirection: "row",
  },
  content: {
    marginLeft: "80px", // Adjust this value to match the width of the sidebar
    padding: "20px",
    width: "100%",
  },
  chartContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
};

export default Dashb;
