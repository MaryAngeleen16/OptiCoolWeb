import React, { useState } from 'react';
import Header from './Components/Layouts/Header';
import './ManageRoom.css';
import Thermostat from './Thermostat';




function ManageRoom() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isAuto, setIsAuto] = useState(false); // State to toggle between Manual and Auto

  const allItems = [
    { name: 'AC 1', status: 'Online' },
    { name: 'AC 2', status: 'Offline' },
    { name: 'EXHAUST FAN', status: 'Online' },
    { name: 'BLOWER', status: 'Offline' },
    { name: 'FAN 1', status: 'Online' },
    { name: 'FAN 2', status: 'Online' },
    { name: 'FAN 3', status: 'Offline' },
    { name: 'FAN 4', status: 'Online' },
    { name: 'TEMP N HUMID SENSOR (OUTSIDE)', status: 'Online' },
    { name: 'TEMP N HUMID SENSOR (INSIDE)', status: 'Offline' },
  ];

  // Filtering logic
  const filteredItems = () => {
    if (activeCategory === 'Appliances') {
      return allItems.filter(item => item.name.includes('AC') || item.name.includes('FAN') || item.name.includes('BLOWER'));
    } else if (activeCategory === 'Sensors') {
      return allItems.filter(item => item.name.includes('SENSOR'));
    }
    return allItems; // Default to "All"
  };

  return (
    <div>
      <Header />

      <div className="ac-container">
        <div className="ac-status">
          <div className="toggle-container">
            <span className={`toggle-label ${!isAuto ? 'active' : ''}`}>Manual</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isAuto}
                onChange={() => setIsAuto(!isAuto)} // Toggles the state
              />
              <span className="slider round"></span>
            </label>
            <span className={`toggle-label ${isAuto ? 'active' : ''}`}>Auto</span>
          </div>


          <div className="thermostats-container">
  <Thermostat />
</div>

        </div>
      </div>

      <div className="buttons-container">
        <button
          className={`buttons-style ${activeCategory === 'All' ? 'active' : ''}`}
          onClick={() => setActiveCategory('All')}
        >
          All
        </button>

        <button
          className={`buttons-style ${activeCategory === 'Appliances' ? 'active' : ''}`}
          onClick={() => setActiveCategory('Appliances')}
        >
          Appliances
        </button>

        <button
          className={`buttons-style ${activeCategory === 'Sensors' ? 'active' : ''}`}
          onClick={() => setActiveCategory('Sensors')}
        >
          Sensors
        </button>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="table-header">
          <div className="column">Appliances</div>
          <div className="column">Status</div>
          <div className="column">Action</div>
        </div>

        {filteredItems().map((item, index) => (
          <div key={index} className="table-row">
            <div className="column">{item.name}</div>
            <div className="column">{item.status}</div>
            <div className="column">
              <button className="report-button">Report</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageRoom;
