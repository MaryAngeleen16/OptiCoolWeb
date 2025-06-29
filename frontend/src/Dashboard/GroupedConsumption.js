import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

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
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Grouped Power Consumption</h1>

      <Select value={filter} onValueChange={(val) => setFilter(val)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(groupedData).map(([group, kwh]) => (
          <Card key={group}>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold">{group}</h2>
              <p className="text-xl">{kwh} kWh</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
