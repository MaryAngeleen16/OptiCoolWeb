import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './Home.js';
import ManageRoom from './ManageRoom.js';
import Login from './Pages/Login.js';
import Register from './Pages/Register.js';
import Dashb from './Dashboard/Dashb.js';
import LandingPage from './Pages/LandingPage.js';
import { useSelector } from 'react-redux';
import ViewProfile from './Pages/UserPages/ViewProfile.js';
import ForgotPassword from './Pages/ForgotPassword.js';
import SendCode from './Pages/SendCode.js';
import ChangePassword from './Pages/ChangePassword.js';
import UsersList from './Pages/AdminPages/UsersList.js';

function App() {

  const { user, isLogin } = useSelector(state => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/LandingPage" replace />} />
        <Route path="/LandingPage" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/manageRoom" element={<ManageRoom />} />
        <Route path="/dashboard" element={<Dashb />} />
        <Route path='/me' element={<ViewProfile />} />
        <Route path='/users' element={<UsersList />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot/password" element={<ForgotPassword />} />
        <Route path="/send/code/:email" element={<SendCode />} />
        <Route path="/change/password/:userId" element={<ChangePassword />} />


      </Routes>
    </Router>
  );
}

export default App;
