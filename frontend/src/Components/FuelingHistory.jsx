import React, { useEffect, useState } from "react";
import CNavbar from "./CNavbar";
import CFooter from "./CFooter";
import { fetchCustomerTransactions } from "../services/customerService";

export default function FuelingHistory() {
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const txns = await fetchCustomerTransactions();
        setAllTransactions(txns);
        setTransactions(txns); // Show all initially
      } catch (error) {
        console.error("Error fetching transactions", error);
      }
    };

    loadTransactions();
  }, []);

  const handleDateChange = (e) => {
    const selected = e.target.value;
    setSelectedDate(selected);

    if (selected) {
      const filtered = allTransactions.filter(txn => {
        const txnDate = new Date(txn.createdAt || txn.date).toISOString().slice(0, 10);
        return txnDate === selected;
      });
      setTransactions(filtered);
    } else {
      setTransactions(allTransactions);
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (err) {
      return "Invalid Date";
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <CNavbar />

      <header className="text-center py-20 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-xl">
        <h2 className="text-5xl font-extrabold text-white drop-shadow-lg">Fueling History</h2>
        <p className="text-gray-300 mt-3 text-lg max-w-2xl mx-auto">
          Easily track your past refueling transactions.
        </p>
      </header>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-6xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">Search Transactions by Date</h2>
        <div className="flex justify-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="p-3 w-1/3 bg-gray-700 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() => {
              setSelectedDate("");
              setTransactions(allTransactions); // Reset filter
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md text-sm"
          >
            Clear Filter
          </button>
        </div>
      </div>

      <section className="flex flex-col items-center p-10 space-y-10">
        <div className="w-full max-w-6xl bg-gray-800 shadow-lg rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-purple-400 text-center mb-6">
            {selectedDate ? `Transactions on ${selectedDate}` : "All Transactions"}
          </h2>
          <table className="w-full text-left border-collapse text-lg">
            <thead>
              <tr className="border-b border-gray-700 text-purple-300">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Petrol Pump</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((txn, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-3 px-4">{formatDate(txn.createdAt || txn.date)}</td>
                    <td className="py-3 px-4">
                      {txn.pump?.pumpName ?? txn.pumpOwner?.pumpName ?? <span className="text-gray-500 italic">Unknown</span>}
                    </td>
                    <td className="py-3 px-4">₹{txn.amount || txn.totalAmount || "0"}</td>
                    <td className="py-3 px-4 text-green-400">{txn.status || "Completed"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-400">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <CFooter />
    </div>
  );
}
