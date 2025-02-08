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
import SummarizeIcon from "@mui/icons-material/Summarize";
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

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
                      <ListItemText primary="Error Report" />
                    </ListItemButton>
                  </ListItem>
                )}

                {user?.role === "admin" && (
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate("/active");
                        setDrawerOpen(false);
                      }}
                    >
                      <ListItemIcon>
                        <SupervisorAccountIcon />
                      </ListItemIcon>
                      <ListItemText primary="Active Users" />
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
