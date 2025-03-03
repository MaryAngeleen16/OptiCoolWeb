import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { removeAuth } from "../../states/authSlice";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupIcon from "@mui/icons-material/Group";
import RoomIcon from "@mui/icons-material/MeetingRoom";
import SummarizeIcon from "@mui/icons-material/Summarize";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import "./Sidebar.css"; // Import the CSS file




function Sidebar() {
  const { isLogin, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(null);

  const handleItemClick = (index, route) => {
    setActiveIndex(index);
    navigate(route);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API}/users/logout`);
      dispatch(removeAuth());
      navigate("/");
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  const menuItems = [
    { icon: <HomeIcon style={{ fontSize: 25 }} />, route: "/home", label: "Home" },
    { icon: <RoomIcon style={{ fontSize: 25 }} />, route: "/manageRoom", label: "Manage Room" },
    { icon: <DashboardIcon style={{ fontSize: 25 }} />, route: "/dashboard", label: "Dashboard" },
    { icon: <AccountCircleIcon style={{ fontSize: 25 }} />, route: "/me", label: "Profile" },
    ...(user?.role === "admin"
      ? [
          { icon: <GroupIcon style={{ fontSize: 25 }} />, route: "/users", label: "Users" },
          { icon: <SummarizeIcon style={{ fontSize: 25 }} />, route: "/ereport", label: "Reports" },
        ]
      : []),
  ];

  return (
    <div className="sidebar-container">
      {isLogin && (
        <>
          <Drawer variant="permanent" className="styled-drawer">
            <List className="sidebar-list">
              {menuItems.map((item, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    className={`sidebar-item ${
                      activeIndex === index ? "active" : ""
                    }`}
                    onClick={() => handleItemClick(index, item.route)}
                  >
                    <ListItemIcon
                      className={`styled-icon ${
                        activeIndex === index ? "active-icon" : ""
                      }`}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      className="sidebar-text"
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              <ListItem disablePadding className="logout-item">
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon className="styled-icon">
                    <LogoutIcon style={{ fontSize: 25 }} />
                  </ListItemIcon>
                  <ListItemText primary="Logout" className="sidebar-text" />
                </ListItemButton>
              </ListItem>
            </List>
          </Drawer>
        </>
      )}
    </div>
  );
}

export default Sidebar;
