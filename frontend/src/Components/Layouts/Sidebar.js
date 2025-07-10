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
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import MenuIcon from "@mui/icons-material/Menu";
import HardwareIcon from '@mui/icons-material/Hardware';
import "./Sidebar.css"; // Import the CSS file
import CalculateIcon from '@mui/icons-material/Calculate';



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
      const { data } = await axios.get(`${process.env.REACT_APP_API}/users/logout/${user._id}`);
      if (data.success === true) {
        dispatch(removeAuth());
        navigate("/");
        // Removed setDrawerOpen since it is not defined in this component
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isLogin) return null;

  const baseMenuItems = [
    { icon: <HomeIcon style={{ fontSize: 25 }} />, route: "/home", label: "Home" },
    { icon: <DashboardIcon style={{ fontSize: 25 }} />, route: "/dashboard", label: "Dashboard" },
    { icon: <AccountCircleIcon style={{ fontSize: 25 }} />, route: "/me", label: "Profile" },
  ];

  const adminMenuItems = [
    { icon: <GroupIcon style={{ fontSize: 25 }} />, route: "/users", label: "Users" },
    { icon: <SummarizeIcon style={{ fontSize: 25 }} />, route: "/ereport", label: "Reports" },
    { icon: <ManageSearchIcon style={{ fontSize: 25 }} />, route: "/activitylog", label: "Logs" },
    { icon: <SupervisorAccountIcon style={{ fontSize: 25 }} />, route: "/active", label: "Active Users" },
    { icon: <HardwareIcon style={{ fontSize: 25 }} />, route: "/add-hardware", label: "Add Hardware" },
    { icon: <CalculateIcon style={{ fontSize: 25 }} />, route: "/consumption-calculator", label: "Consumption Calculator" },
  ];

  const menuItems = user?.role === "admin" ? [...baseMenuItems, ...adminMenuItems] : baseMenuItems;

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
