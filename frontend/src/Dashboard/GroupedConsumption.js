import React, { useEffect, useState } from "react";
import axios from "axios";

export default function GroupedConsumptionViewer() {
  const [groupedData, setGroupedData] = useState({});
  const [filter, setFilter] = useState("daily");

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const res = await axios.get("https://opticoolweb-backend.onrender.com/api/v1/grouped-consumptions");
      setGroupedData(res.data);
    } catch (err) {
      console.error("Error fetching grouped consumption:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Grouped Power Consumption</h1>

      <select
        className="border p-2 rounded"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="daily">Daily</option>
        <option value="monthly">Monthly</option>
      </select>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(groupedData).map(([group, kwh]) => (
          <div key={group} className="border rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold">{group}</h2>
            <p className="text-xl">{kwh} kWh</p>
          </div>
        ))}
      </div>
    </div>
  );
}
