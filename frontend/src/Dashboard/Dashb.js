import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './Dashboard.css'; 
import Header from '../Components/Layouts/Header';
import HumidityUsage from './HumidityUsage';
import ElectricityUsage from './ElectricityUsage';
import TemperatureUsage from './TemperatureUsage';
import './StylesUsage.css';
const Dashb = () => {
  return (
    <div className="dashboard-container">
         <Header />

         <HumidityUsage/>

         <ElectricityUsage/>

         <TemperatureUsage />
    </div>
  );
};

export default Dashb;

