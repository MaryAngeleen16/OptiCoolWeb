import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './Dashboard.css'; 
import Header from '../Components/Layouts/Header';

const Dashb = () => {
  return (
    <div className="dashboard-container">
         <Header />
    </div>
  );
};

export default Dashb;

