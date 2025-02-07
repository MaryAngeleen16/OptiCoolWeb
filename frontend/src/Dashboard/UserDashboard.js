import React, { useState } from "react";
import { Card, Typography, Grid, Switch, Box, Select, MenuItem } from "@mui/material";
import WbCloudyIcon from "@mui/icons-material/WbCloudy";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import KitchenIcon from "@mui/icons-material/Kitchen";
import BoltIcon from "@mui/icons-material/Bolt";

const UserDashboard = () => {
  const [devices, setDevices] = useState({
    refrigerator: true,
    temperature: true,
    airConditioner: false,
    lights: false,
  });

  const handleToggle = (device) => {
    setDevices((prev) => ({ ...prev, [device]: !prev[device] }));
  };

  return (
    <Box sx={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Welcome Section */}
      <Card
        sx={{
          background: "#FDEDDC",
          padding: "20px",
          borderRadius: "15px",
          marginBottom: "20px",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#FF6F00" }}>
          Hello, Scarlett!
        </Typography>
        <Typography variant="body1">
          Welcome Home! The air quality is good & fresh, you can go out today.
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", marginRight: "10px" }}>
            +25°C
          </Typography>
          <Typography variant="body2">Outdoor temperature</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
          <WbCloudyIcon sx={{ marginRight: "5px", color: "#636e72" }} />
          <Typography variant="body2">Fuzzy cloudy weather</Typography>
        </Box>
      </Card>

      {/* Home Control Section */}
      <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
        Scarlett’s Home
      </Typography>

      <Grid container spacing={2} alignItems="center">
        {/* Humidity & Temperature */}
        <Grid item xs={4}>
          <Typography variant="body2">💧 35% | 🌡️ 15°C</Typography>
        </Grid>
        {/* Room Selector */}
        <Grid item xs={8} sx={{ textAlign: "right" }}>
          <Select size="small" defaultValue="Living Room">
            <MenuItem value="Living Room">Living Room</MenuItem>
            <MenuItem value="Bedroom">Bedroom</MenuItem>
          </Select>
        </Grid>
      </Grid>

      {/* Device Controls */}
      <Grid container spacing={2} sx={{ marginTop: "20px" }}>
        {[
          { key: "refrigerator", label: "Refrigerator", icon: <KitchenIcon /> },
          { key: "temperature", label: "Temperature", icon: <BoltIcon /> },
          { key: "airConditioner", label: "Air Conditioner", icon: <AcUnitIcon /> },
          { key: "lights", label: "Lights", icon: <LightbulbIcon /> },
        ].map(({ key, label, icon }) => (
          <Grid item xs={6} key={key}>
            <Card
              sx={{
                padding: "15px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: devices[key] ? "#6C4FF5" : "#F5F5F5",
                color: devices[key] ? "white" : "black",
                borderRadius: "15px",
              }}
            >
              {icon}
              <Typography variant="body1">{label}</Typography>
              <Switch
                checked={devices[key]}
                onChange={() => handleToggle(key)}
                sx={{
                  "& .MuiSwitch-thumb": { backgroundColor: devices[key] ? "white" : "#6C4FF5" },
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UserDashboard;
