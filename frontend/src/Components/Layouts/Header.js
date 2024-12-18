import React from 'react';
import './Header.css';  // Your custom CSS file
import ManageRoom from '../../ManageRoom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
function Header() {
  return (
    <div className="headercustom">  {/* Custom header section */}
      <div className="navbar">
        <a href="/home">Home</a>
        <a href="/manageRoom">Manage Room</a>
        <a href="/">Dashboard</a>


      </div>
    </div>
  );
}

export default Header;
