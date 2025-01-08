import React from "react";
import "./Header.css";
import ManageRoom from "../../ManageRoom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

function Header() {
  return (
    <div className="headercustom">
      {/* Custom header section */}
      <div className="navbar">
      <img className="logo" src="/OptiCool Logo.png" alt="OptiCool Logo" />
        <div className="logo-container">
            <span className="logo-title">Home</span>
            <span className="logo-subtitle">DMT Room</span>
        </div>

        <a href="/home">Home</a>
        <a href="/manageRoom">Manage Room</a>
        <a href="/">Dashboard</a>
      </div>
    </div>
  );
}

export default Header;
