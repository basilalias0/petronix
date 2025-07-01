import { useEffect, useState } from "react";
import SNavbar from "./SNavbar";
import SFooter from "./SFooter";
import axios from "axios";

// Convert 24-hour time to 12-hour format
const convertTo12HourFormat = (time) => {
  let [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

// Function to filter transactions by time
const filterTransactionsByTime = (transactions, startTime, endTime, date) => {
  const startTimeParts = startTime.split(":").map(Number);
  const endTimeParts = endTime.split(":").map(Number);
  
  const startDateTime = new Date(date);
  startDateTime.setHours(startTimeParts[0], startTimeParts[1], 0, 0);
  
  const endDateTime = new Date(date);
  endDateTime.setHours(endTimeParts[0], endTimeParts[1], 59, 999);

  return transactions.filter((txn) => {
    const txnDate = new Date(txn.createdAt);
    return txnDate >= startDateTime && txnDate <= endDateTime;
  });
};

export default function TransactionHistory() {
  const [searchEmail, setSearchEmail] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Added error state

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(""); // Reset error state on each fetch attempt

        // Prepare query parameters
        const params = new URLSearchParams();
        if (searchEmail) params.append("email", searchEmail);
        if (filterDate) params.append("date", filterDate); // Send only the date to the backend
        if (startTime) params.append("startTime", startTime); // Send startTime to the backend
        if (endTime) params.append("endTime", endTime); // Send endTime to the backend

        const token = sessionStorage.getItem("token");
        if (!token) {
          throw new Error("Authorization token is missing.");
        }
        console.log(params);
        
   
        const response = await axios.get(
          `http://localhost:5000/api/v1/salesRep/anytransactions?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Handle response data
        setTransactions(response.data || []);
        setFilteredTransactions(response.data || []); // Initially set all transactions as filtered

      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message || "An error occurred while fetching transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [searchEmail, filterDate, startTime, endTime]); // Added startTime and endTime to dependency array

  useEffect(() => {
    // Filter transactions when startTime, endTime, or date changes
    if (startTime && endTime && filterDate) {
      const filtered = filterTransactionsByTime(transactions, startTime, endTime, filterDate);
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions); // Reset filtering if no time range
    }
  }, [startTime, endTime, filterDate, transactions]);

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col">
      <SNavbar />

      {/* Hero Section */}
      <header className="text-center py-10 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-lg">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
          Transaction History
        </h1>
        <p className="text-gray-300 mt-3 text-lg max-w-xl mx-auto">
          View and filter fueling transactions easily.
        </p>
      </header>

      {/* Main Content */}
      <section className="flex flex-col items-center p-10 space-y-8 flex-1">
        <div className="w-full max-w-6xl bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4">
          {/* Search & Filters */}
          <div className="flex gap-4 flex-wrap">
            <input
              type="email"
              placeholder="Search customer email..."
              className="p-3 flex-1 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
            <input
              type="date"
              className="p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <div className="flex flex-col">
              <label className="text-gray-400 text-sm">⏳ Shift Start</label>
              <input
                type="time"
                className="p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-400 text-sm">⏰ Shift End</label>
              <input
                type="time"
                className="p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-lg">
              <thead>
                <tr className="border-b border-gray-700 text-purple-300">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Customer Email</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Fuel Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-gray-400">
                      Loading transactions...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-red-400">
                      {error}
                    </td>
                  </tr>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((txn, index) => (
                    <tr key={txn._id || index} className="border-b border-gray-700">
                      <td className="py-3 px-4">{txn.customer?.firstName || "N/A"}</td>
                      <td className="py-3 px-4">{txn.customer?.email || "N/A"}</td>
                      <td className="py-3 px-4">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {convertTo12HourFormat(
                          new Date(txn.createdAt).toTimeString().slice(0, 5)
                        )}
                      </td>
                      <td className="py-3 px-4">{txn.fuelType}</td>
                      <td className="py-3 px-4">₹{txn.amount}</td>
                      <td className="py-3 px-4 text-green-400 font-bold">Paid</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SFooter />
    </div>
  );
}
