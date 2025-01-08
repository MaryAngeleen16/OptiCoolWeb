import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './Home.js';
import ManageRoom from './ManageRoom.js';
import Login from './Pages/Login.js';
import Register from './Pages/Register.js';
import Dashb from './Dashboard/Dashb.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/manageRoom" element={<ManageRoom />} />
        <Route path="/dashboard" element={<Dashb />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </Router>
  );
}

export default App;
