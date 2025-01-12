import React from "react";
import "./Header.css";
import ManageRoom from "../../ManageRoom";
import { BrowserRouter as Router, Route, Switch, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeAuth } from "../../states/authSlice";
import LogoutIcon from '@mui/icons-material/Logout';

function Header() {

  const { isLogin, user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = (e) => {
    dispatch(removeAuth());
    navigate('/')
    e.preventDefault()
  }

  return (
    <div className="headercustom">
      {/* Custom header section */}
      <div className="navbar">

        {isLogin && (
          <>
            <img className="logo" src="/OptiCool Logo.png" alt="OptiCool Logo" />
          </>
        )}

        <div className="logo-container">

          {isLogin && (
            <>
              <span className="logo-title">Home</span>
              <span className="logo-subtitle">DMT Room</span>
            </>
          )}

        </div>

      </div>


      <div className="navbar">

        {isLogin && (
          <>
            <a href="/home">Home</a>
            <a href="/manageRoom">Manage Room</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/me">My Profile</a>
            <a href="/users">Users</a>

            <div style={{ marginLeft: 10, cursor: 'pointer' }} onClick={handleLogout}>
              <LogoutIcon />
            </div>
          </>
        )}

        {!isLogin && (
          <>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </>
        )}

      </div>
    </div >
  );
}

export default Header;
