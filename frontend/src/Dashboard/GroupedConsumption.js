import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function GroupedConsumptionChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupedData();
  }, []);

  const fetchGroupedData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://opticoolweb-backend.onrender.com/api/v1/grouped-consumptions"
      );
      const grouped = res.data;
      const transformed = transformToChartFormat(grouped);
      setChartData(transformed);
    } catch (err) {
      console.error("Error fetching grouped consumption:", err);
    } finally {
      setLoading(false);
    }
  };

  const transformToChartFormat = (data) => {
    const output = [];
    for (const [key, value] of Object.entries(data)) {
      if (key !== "Total") {
        output.push({ group: key, kWh: value });
      }
    }
    return output;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Grouped Power Consumption Chart</h1>
      {loading ? (
        <p>Loading chart...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="group" />
            <YAxis unit=" kWh" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="kWh" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
