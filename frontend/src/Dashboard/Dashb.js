import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./Dashboard.css";
import HumidityUsage from "./HumidityUsage";
import TemperatureUsage from "./TemperatureUsage";
import UsageTracking from "../Pages/HomePages/UsageTracking";
import "./StylesUsage.css";
import Sidebar from "../Components/Layouts/Sidebar";
import UsagePDF from "./UsagePDF";
import GroupedConsumption from "./GroupedConsumption";

const Dashb = () => {
  return (
    <div style={styles.dashboardContainer}>
      
     <Sidebar /> 
      <div style={styles.content}>
         <div style={{ display: "flex", justifyContent: "flex-end", marginRight: "20px" }}>
           <UsagePDF />
        </div>
        <div style={styles.chartContainer}>
            <h1 >Usage Dashboard</h1>

          <HumidityUsage />
          <TemperatureUsage />
          <UsageTracking />
          <GroupedConsumption />
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
