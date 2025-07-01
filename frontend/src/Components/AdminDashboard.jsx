import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = sessionStorage.getItem("token");

        // Fetch Total Stats
        const usersResponse = await axios.get(
          "http://localhost:5000/api/v1/admin/customerCount",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      
        
        setStats(usersResponse.data); // Assuming backend returns { totalUsers, totalTransactions, totalCreditUsage }
       
       
        // Fetch Recent Transactions
        const transactionsResponse = await axios.get(
          "http://localhost:5000/api/v1/admin/daily-credit-totals",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTransactions(transactionsResponse.data); // Assuming backend returns an array
        
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const getStatusColor = (status) => {
    if (!status) return "text-gray-300"; // Default for undefined/null/empty
  
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "processing":
        return "text-blue-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />

      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-purple-500">Admin Dashboard</h1>

        {loading ? (
          <p className="mt-6">Loading dashboard data...</p>
        ) : (
          <>
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {[
                { title: "Total Users", value: stats.length },
                { title: "Transactions", value: transactions.length },
                { title: "Credit Usage", value: `Rs ${transactions.reduce(
                  (sum, tx) => sum + tx.totalAmount,
                  0)}` },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold">{stat.title}</h3>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Credit Transactions */}
            <h2 className="mt-8 text-2xl font-bold">Recent Credit Transactions</h2>
            <div className="bg-gray-800 p-4 rounded-lg mt-4 shadow-md overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-gray-300">
                    <th className="py-3 px-4 border-b">User</th>
                    <th className="py-3 px-4 border-b">Credit Amount</th>
                    <th className="py-3 px-4 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((tx, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-600 hover:bg-gray-700 transition"
                    >
                    
                      <td className="py-3 px-4">{tx.user || "N/A"}</td>
                      <td className="py-3 px-4">Rs {tx.amount || 0}</td>
                      <td
                        className={`py-3 px-4 font-bold ${getStatusColor(tx.status)}`}
                      >
                        {tx.status || "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
