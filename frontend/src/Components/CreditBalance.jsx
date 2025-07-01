import React, { useState, useEffect } from "react";
import { fetchCreditDataAPI } from "../services/customerService"; // Import the service
import CNavbar from "./CNavbar";
import CFooter from "./CFooter";
import { CalendarDays, Clock, CreditCard, CheckCircle } from "lucide-react";

export default function CreditBalance() {
  const [creditData, setCreditData] = useState({
    totalApprovedCredit: 0,
    usedCredit: 0,
    balanceCredit: 0,
    paybackDaysLeft: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [approvedCredits, setApprovedCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCreditData();
  }, []);

  const fetchCreditData = async () => {
    try {
      const data = await fetchCreditDataAPI(); // Call the API service
      const {
        totalApprovedCredit,
        usedCredit,
        balanceCredit,
        paybackDaysLeft,
        creditTransactions,
        fuelingTransactions,
      } = data;

      setCreditData({ totalApprovedCredit, usedCredit, balanceCredit, paybackDaysLeft });
      setTransactions(fuelingTransactions);
      setApprovedCredits(creditTransactions || []);
    } catch (err) {
      console.error("Error fetching credit data:", err);
      setError("Failed to load credit data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getPaybackDaysLeft = (createdAt) => {
    const daysPassed = Math.floor((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    return 30 - daysPassed;
  };

  if (loading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-2xl text-gray-300">Loading credit information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-2xl text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <CNavbar />

      <header className="text-center py-20 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-xl">
        <h2 className="text-5xl font-extrabold text-white drop-shadow-lg">Credit Balance</h2>
        <p className="text-gray-300 mt-3 text-lg max-w-2xl mx-auto">
          View your approved credit and transaction history.
        </p>
      </header>

      <section className="p-10 flex flex-col items-center space-y-10">
        {/* Credit Summary */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-6xl text-center">
          <h2 className="text-2xl font-semibold text-purple-400">Current Credit Summary</h2>
          <div className="mt-4 text-lg">
            <p className="text-gray-300">Approved Credit: <span className="text-green-400 font-bold">₹{creditData.totalApprovedCredit.toLocaleString()}</span></p>
            <p className="text-gray-300">Used Credit: <span className="text-yellow-400 font-bold">₹{creditData.usedCredit.toLocaleString()}</span></p>
            <p className="text-gray-300">Balance Credit: <span className="text-red-400 font-bold">₹{creditData.balanceCredit.toLocaleString()}</span></p>
            
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-6xl">
          <h2 className="text-2xl font-semibold text-purple-400 text-center mb-4">Transaction History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-base">
              <thead>
                <tr className="border-b border-gray-700 text-gray-300">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Fuel Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((txn, index) => {
                    const transactionDate = txn.createdAt
                      ? new Date(txn.createdAt)
                      : txn.transactionDate
                        ? new Date(txn.transactionDate)
                        : new Date();
                    console.log(transactions);

                    if (isNaN(transactionDate.getTime())) {
                      console.warn(`Invalid date for transaction ${txn._id}:`, txn);
                      return null;
                    }

                    return (
                      <tr
                        key={index}
                        className="border-b border-gray-700 hover:bg-gray-700 transition duration-200"
                      >
                        <td className="py-3 px-4">{transactionDate.toISOString().split("T")[0]}</td>
                        <td className="py-3 px-4">{txn.note || (txn.type === "credit" ? "Credit Issued" : "Payment Made")}</td>
                        <td className="py-3 px-4">{ txn.fuelType ? txn.fuelType : "—"}</td>
                        <td className="py-3 px-4">₹{Math.abs(txn.amount).toLocaleString()}</td>
                        <td className={`py-3 px-4 font-semibold ${txn.creditRequestStatus === "approved" || txn.paymentStatus === "succeeded" ? "text-green-400" : "text-red-400"}`}>
                          {txn.type === "credit" ? txn.creditRequestStatus || "N/A" : txn.paymentStatus || "N/A"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-400">
                      No transactions for this customer
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <CFooter />
    </div>
  );
}
