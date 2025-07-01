import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

export default function TransactionMonitoring() {
  const [creditData, setCreditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          throw new Error("Authorization token not found in session storage.");
        }

        const response = await axios.get(
          "http://localhost:5000/api/v1/customer-credit-transaction/transactions/credits",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCreditData(response.data);
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message;
        console.error("Error fetching data:", errMsg);
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-purple-500">Credit Payback Monitoring</h1>
        <p className="text-gray-400 mt-2">Track credit payment status for all users.</p>

        {loading ? (
          <p className="text-gray-400 mt-6">Loading data...</p>
        ) : error ? (
          <p className="text-red-500 mt-6">Error: {error}</p>
        ) : (
          <>
            <TransactionTable
              title="Paid Users"
              data={creditData.creditTransactions.filter(txn => txn.paymentStatus === 'succeeded')}
            />
            <TransactionTable
              title="Unpaid Users"
              data={creditData.creditTransactions.filter(txn => txn.paymentStatus !== 'succeeded')}
            />
          </>
        )}
      </main>
    </div>
  );
}

function TransactionTable({ title, data }) {
  const getStatusColor = (status) => {
    const statusColors = {
      paid: "text-green-400",
      unpaid: "text-red-400",
      default: "text-yellow-400",
    };
    return statusColors[status?.toLowerCase()] || statusColors.default;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mt-6">
      <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
      <div className="relative overflow-x-auto">
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-700">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-700 text-gray-300 z-10">
              <tr>
                <th className="py-3 px-4 w-1/5">User</th>
                <th className="py-3 px-4 w-1/5">Email</th>
                <th className="py-3 px-4 w-1/5">Amount</th>
                <th className="py-3 px-4 w-1/5">Due Date</th>
                <th className="py-3 px-4 w-1/5">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                data.map((entry) => (
                  <tr key={entry._id} className="border-b border-gray-600">
                    <td className="py-3 px-4 w-1/5">{entry.customer?.firstName || "N/A"}</td>
                    <td className="py-3 px-4 w-1/5">{entry.customer?.email || "N/A"}</td>
                    <td className="py-3 px-4 w-1/5">
                      ₹{Number(entry.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 w-1/5">
                      {entry.createdAt
                        ? new Date(entry.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className={`py-3 px-4 w-1/5 font-medium ${getStatusColor(entry.paymentStatus)}`}>
                      {entry.paymentStatus || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
