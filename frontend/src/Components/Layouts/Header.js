// import React from "react";
// import "./Header.css";
// import ManageRoom from "../../ManageRoom";
// import { BrowserRouter as Router, Route, Switch, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { removeAuth } from "../../states/authSlice";
// import LogoutIcon from '@mui/icons-material/Logout';

// function Header() {

//   const { isLogin, user } = useSelector(state => state.auth);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const handleLogout = (e) => {
//     dispatch(removeAuth());
//     navigate('/')
//     e.preventDefault()
//   }

//   return (
//     <div className="headercustom">
//       {/* Custom header section */}
//       <div className="navbar">

//         {isLogin && (
//           <>
//             <img className="logo" src="/OptiCool Logo.png" alt="OptiCool Logo" />
//           </>
//         )}

//         <div className="logo-container">

//           {isLogin && (
//             <>
//               <span className="logo-title">Home</span>
//               <span className="logo-subtitle">DMT Room</span>
//             </>
//           )}

//         </div>

//       </div>

//       <div className="navbar">

//         {isLogin && (
//           <>
//             <a href="/home">Home</a>
//             <a href="/manageRoom">Manage Room</a>
//             <a href="/dashboard">Dashboard</a>
//             <a href="/me">My Profile</a>
//             <a href="/users">Users</a>

//             <div style={{ marginLeft: 10, cursor: 'pointer' }} onClick={handleLogout}>
//               <LogoutIcon />
//             </div>
//           </>
//         )}

//         {!isLogin && (
//           <>
//             <a href="/login">Login</a>
//             <a href="/register">Register</a>
//           </>
//         )}

//       </div>
//     </div >
//   );
// }

// export default Header;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeAuth } from "../../states/authSlice";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupIcon from "@mui/icons-material/Group";
import RoomIcon from "@mui/icons-material/MeetingRoom";
import SummarizeIcon from '@mui/icons-material/Summarize';
import "./Header.css";

function Header() {
  const { isLogin, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    dispatch(removeAuth());
    navigate("/");
    setDrawerOpen(false);
  };

  return (
    <div className="headercustom">
      <div className="navbar">
        {isLogin && (
          <img className="logo" src="/OptiCool Logo.png" alt="OptiCool Logo" />
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
        {isLogin ? (
          <>
            <IconButton onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>

            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              <List sx={{ width: 250 }}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate("/home");
                      setDrawerOpen(false);
                    }}
                  >
                    <ListItemIcon>
                      <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate("/manageRoom");
                      setDrawerOpen(false);
                    }}
                  >
                    <ListItemIcon>
                      <RoomIcon />
                    </ListItemIcon>
                    <ListItemText primary="Manage Room" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate("/dashboard");
                      setDrawerOpen(false);
                    }}
                  >
                    <ListItemIcon>
                      <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate("/me");
                      setDrawerOpen(false);
                    }}
                  >
                    <ListItemIcon>
                      <AccountCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary="My Profile" />
                  </ListItemButton>
                </ListItem>

                {user?.role === "admin" && (
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate("/users");
                        setDrawerOpen(false);
                      }}
                    >
                      <ListItemIcon>
                        <GroupIcon />
                      </ListItemIcon>
                      <ListItemText primary="Users" />
                    </ListItemButton>
                  </ListItem>
                )}

                {user?.role === "admin" && (
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate("/ereport");
                        setDrawerOpen(false);
                      }}
                    >
                      <ListItemIcon>
                        <SummarizeIcon />
                      </ListItemIcon>
                      <ListItemText primary="Error Reports" />
                    </ListItemButton>
                  </ListItem>
                )}

                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Drawer>
          </>
        ) : (
          <>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
