import { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ONavbar from "./ONavbar";
import OFooter from "./OFooter";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ReportsAnalytics() {
  const [salesData, setSalesData] = useState({ petrol: 0, diesel: 0, cng: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/v1/transcation/pie`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      if (response.status === 200) {
        setSalesData(data.fuelSales || { petrol: 0, diesel: 0, cng: 0 });
      } else {
        setError(data.message || "Failed to fetch sales data.");
        setSalesData({ petrol: 0, diesel: 0, cng: 0 });
      }
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError("Failed to load sales data.");
      setSalesData({ petrol: 0, diesel: 0, cng: 0 });
    } finally {
      setLoading(false);
    }
  };

  const pieData = {
    labels: ["Petrol", "Diesel", "CNG"],
    datasets: [
      {
        label: "Fuel Sales (₹)",
        data: [salesData.petrol, salesData.diesel, salesData.cng],
        backgroundColor: ["#FFD700", "#32CD32", "#1E90FF"],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "white",
          font: { size: 14 },
        },
      },
      tooltip: {
        backgroundColor: "#222",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
  };

  return (
    <div className="flex flex-col bg-gray-900 text-white min-h-screen">
      <ONavbar />

      <header className="text-center py-10 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-lg">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">Reports & Analytics</h1>
        <p className="text-gray-300 mt-3 text-lg max-w-xl mx-auto">
          Visual insights into your fuel sales.
        </p>
      </header>

      <main className="flex flex-col items-center p-10 space-y-8 flex-1">
        <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
          {error && <p className="text-red-500 text-lg font-semibold text-center">{error}</p>}

          {/* Pie Chart Section */}
          <div className="flex flex-col items-center bg-gradient-to-tr from-purple-700 to-indigo-800 p-5 rounded-xl shadow-md hover:scale-105 transition-transform w-full">
            <h2 className="text-xl font-semibold mb-4">Fuel Sales Distribution</h2>
            <div className="w-96 h-96">
              {loading ? (
                <p className="text-white">Loading chart...</p>
              ) : (
                <Pie data={pieData} options={pieOptions} />
              )}
            </div>
          </div>
        </div>
      </main>

      <OFooter />
    </div>
  );
}
