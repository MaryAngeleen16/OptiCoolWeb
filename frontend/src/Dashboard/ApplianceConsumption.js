import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const APPLIANCE_GROUPS = {
  ACs: ["AC 1", "AC 2"],
  Fans: ["Fan 1", "Fan 2", "Fan 3", "Fan 4"],
  Exhausts: ["Exhaust 1", "Exhaust 2"],
  Blowers: ["Blower 1"]
};

export default function ApplianceConsumption() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API}/appliance-consumption`)
      .then(res => setData(res.data))
      .catch(err => console.error("Failed to fetch consumption data:", err));
  }, []);

  const groupData = (keys, label) => {
    const filtered = data.filter(d => keys.includes(d.appliance));
    const totalKWh = filtered.reduce((sum, item) => sum + item.estimatedConsumptionKWh, 0);
    return [{ name: label, Consumption: parseFloat(totalKWh.toFixed(2)) }];
  };

  const acData = APPLIANCE_GROUPS.ACs.map(name => {
    const entry = data.find(d => d.appliance === name);
    return {
      name,
      Consumption: entry ? parseFloat(entry.estimatedConsumptionKWh.toFixed(2)) : 0
    };
  });

  const groupedData = {
    Fans: groupData(APPLIANCE_GROUPS.Fans, "Total Fans"),
    Exhausts: groupData(APPLIANCE_GROUPS.Exhausts, "Total Exhausts"),
    Blowers: groupData(APPLIANCE_GROUPS.Blowers, "Blower 1")
  };

  return (
    <div className="p-4 grid grid-cols-1 gap-8">
      <div>
        <h2 className="text-xl font-bold mb-2">Air Conditioners</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={acData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Consumption" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Fans</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={groupedData.Fans}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Consumption" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Exhaust Fans</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={groupedData.Exhausts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Consumption" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Blower</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={groupedData.Blowers}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Consumption" fill="#ff7f50" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
