import { useState, useEffect } from "react";
import axios from "axios"; // Import axios
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import ONavbar from "./ONavbar";
import OFooter from "./OFooter";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function FuelSalesTracking() {
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const labels = {
    daily: ["Today"],
    weekly: ["Current Week"],
    monthly: ["Current Month"]
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token"); // Assuming token-based auth
        const response = await axios.get(`http://localhost:5000/api/v1/transcation/track`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Sales Data Response: ", response.data); // Log the response for debugging
        setSalesData(response.data.salesData || []); // Ensure it's an array
      } catch (error) {
        console.error("Error fetching sales data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [selectedPeriod]);

  const getChartData = (fuelSales) => {
    return {
      labels: labels[selectedPeriod],
      datasets: [
        {
          label: "Petrol Sales (₹)",
          data: [fuelSales.petrol],
          backgroundColor: "rgba(234, 179, 8, 0.6)",
          borderColor: "#facc15",
          borderWidth: 2
        },
        {
          label: "Diesel Sales (₹)",
          data: [fuelSales.diesel],
          backgroundColor: "rgba(52, 211, 153, 0.6)",
          borderColor: "#34d399",
          borderWidth: 2
        },
        {
          label: "CNG Sales (₹)",
          data: [fuelSales.cng],
          backgroundColor: "rgba(59, 130, 246, 0.6)",
          borderColor: "#3b82f6",
          borderWidth: 2
        }
      ]
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <ONavbar />
      <header className="text-center py-10 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-lg">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
          Fuel Sales Tracking
        </h1>
        <p className="text-gray-300 mt-3 text-lg max-w-xl mx-auto">
          Monitor your fuel sales categorized by fuel type for each pump.
        </p>
      </header>
      <main className="flex-1 p-10 flex flex-col items-center space-y-10">
        <div className="flex space-x-4">
          {["daily", "weekly", "monthly"].map((period) => (
            <button
              key={period}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                selectedPeriod === period
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : (
          Array.isArray(salesData) && salesData.length > 0 ? (
            salesData.map((pumpData) => (
              <div
                key={pumpData.pumpId}
                className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
              >
                <h2 className="text-2xl font-semibold mb-4 text-yellow-400">
                  Sales Overview for {pumpData.pumpName} ({selectedPeriod.toUpperCase()})
                </h2>
                <div className="w-full h-[400px]">
                  <Bar data={getChartData(pumpData.fuelSales)} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No sales data available</p>
          )
        )}
      </main>
      <OFooter />
    </div>
  );
}
