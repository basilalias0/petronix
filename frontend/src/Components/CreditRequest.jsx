import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import CNavbar from "./CNavbar";
import CFooter from "./CFooter";
import { fetchCreditTransactionsAPI, submitCreditRequestAPI } from "../services/customerService"; // Import API services

export default function CreditRequest() {
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch credit transactions
  const fetchTransactions = async () => {
    try {
      const data = await fetchCreditTransactionsAPI(); // Call the fetch service
      console.log("Transactions:", data);
      setCreditTransactions(data.creditTransactions || []);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Submit credit request
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;

    try {
      setLoading(true);
      await submitCreditRequestAPI(parseFloat(amount)); // Call the submit service
      setAmount("");
      await fetchTransactions(); // Refresh the transaction list
    } catch (err) {
      alert(err.response?.data?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <CNavbar />

      <header className="text-center py-20 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-xl">
        <h2 className="text-5xl font-extrabold text-white drop-shadow-lg">
          Credit Request
        </h2>
        <p className="text-gray-300 mt-3 text-lg max-w-2xl mx-auto">
          Easily track your credit requests and submit new ones.
        </p>
      </header>

      <section className="p-10 flex flex-col items-center space-y-10">
        {/* Credit Status Table */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-6xl">
          <h2 className="text-2xl font-semibold text-center mb-4 text-purple-400">
            Credit Requests
          </h2>
          <table className="w-full text-left border-collapse text-base">
            <thead>
              <tr className="border-b border-gray-700 text-gray-300">
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {creditTransactions.length > 0 ? (
                creditTransactions.map((tx, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-700 hover:bg-gray-700 transition duration-200"
                  >
                    <td className="py-3 px-4">${tx.amount}</td>
                    <td className="py-3 px-4">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        tx.creditRequestStatus === "Pending"
                          ? "text-yellow-400"
                          : tx.creditRequestStatus === "approved"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {tx.creditRequestStatus || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-gray-400 py-4">
                    No credit requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Credit Request Form */}
        <div className="w-full max-w-6xl bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-purple-400 mb-6">
            Request Credit
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-left px-10">
              <label className="block text-gray-400 text-lg mb-2">
                Amount (in $)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-4 bg-gray-700 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter credit amount"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-xs mx-auto bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg flex justify-center items-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>{loading ? "Submitting..." : "Submit Request"}</span>
            </button>
          </form>
        </div>
      </section>

      <CFooter />
    </div>
  );
}
