import React, { useEffect, useState } from "react";
import axios from "axios";

export default function GroupedConsumptionViewer() {
  const [groupedData, setGroupedData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://opticoolweb-backend.onrender.com/api/v1/grouped-consumptions");
      setGroupedData(res.data);
    } catch (err) {
      console.error("Error fetching grouped consumption:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Grouped Power Consumption</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {groupedData.Total && (
            <div className="border rounded-xl shadow p-4 bg-blue-100">
              <h2 className="text-lg font-semibold">Total Power Consumption</h2>
              <p className="text-2xl font-bold">{groupedData.Total} kWh</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(groupedData)
              .filter(([key]) => key !== "Total")
              .map(([group, kwh]) => (
                <div key={group} className="border rounded-xl shadow p-4">
                  <h2 className="text-lg font-semibold">{group}</h2>
                  <p className="text-xl">{kwh} kWh</p>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
