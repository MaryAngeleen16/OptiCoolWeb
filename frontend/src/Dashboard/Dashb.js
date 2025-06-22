import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./Dashboard.css";
import HumidityUsage from "./HumidityUsage";
import TemperatureUsage from "./TemperatureUsage";
import UsageTracking from "../Pages/HomePages/UsageTracking";
import "./StylesUsage.css";
import Sidebar from "../Components/Layouts/Sidebar";
import UsagePDF from "./UsagePDF";

const Dashb = () => {
  return (
    <div style={styles.dashboardContainer}>
 
     <Sidebar /> 
      <div style={styles.content}>
        <div style={styles.chartContainer}>
          <UsagePDF />
          <HumidityUsage />
          <TemperatureUsage />
          <UsageTracking />
        </div>
      </div>
      {/* <Sidebar /> */}
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
