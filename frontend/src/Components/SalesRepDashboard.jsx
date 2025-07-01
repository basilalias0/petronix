import { useEffect, useState } from "react";
import axios from "axios";
import SNavbar from "./SNavbar";
import SFooter from "./SFooter";

const convertTo12HourFormat = (time) => {
  let [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export default function SalesRepDashboard() {
  // Use sessionStorage for default values and store shift times in state
  const [salesRepShiftStart, setStartTime] = useState(() => sessionStorage.getItem("salesRepShiftStart") || "00:00");
  const [salesRepShiftEnd, setEndTime] = useState(() => sessionStorage.getItem("salesRepShiftEnd") || "23:59");

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Save shift time to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("salesRepShiftStart", salesRepShiftStart);
    sessionStorage.setItem("salesRepShiftEnd", salesRepShiftEnd);
  }, [salesRepShiftStart, salesRepShiftEnd]);

  // Fetch transactions whenever shift time changes
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/v1/salesRep/transactions/today?shiftStart=${salesRepShiftStart}&shiftEnd=${salesRepShiftEnd}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTransactions(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [salesRepShiftStart, salesRepShiftEnd]); // Fix the typo here

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col">
      <SNavbar />

      <header className="text-center py-10 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-lg">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
          Welcome to Petronix
        </h1>
        <p className="text-gray-300 mt-3 text-lg max-w-xl mx-auto">
          Manage your daily transactions efficiently.
        </p>
      </header>

      <div className="flex justify-center space-x-4 p-6">
        <div>
          <label className="block text-lg font-semibold">Start Time</label>
          <input
            type="time"
            value={salesRepShiftStart} // Update to use salesRepShiftStart
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-lg font-semibold">End Time</label>
          <input
            type="time"
            value={salesRepShiftEnd} // Update to use salesRepShiftEnd
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded-lg"
          />
        </div>
      </div>

      <section className="flex flex-col items-center p-10 flex-1">
        <div className="w-full max-w-6xl bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center">
            Transactions (Shift: {convertTo12HourFormat(salesRepShiftStart)} - {convertTo12HourFormat(salesRepShiftEnd)})
          </h2>
          <table className="w-full text-left border-collapse text-lg">
            <thead>
              <tr className="border-b border-gray-700 text-purple-300">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Pump</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((txn) => (
                  <tr key={txn._id} className="border-b border-gray-700">
                    <td className="py-3 px-4">
                      {txn.customer ? `${txn.customer.firstName} ${txn.customer.lastName}` : "N/A"}
                    </td>
                    <td className="py-3 px-4">{txn.customer?.email || "N/A"}</td>
                    <td className="py-3 px-4">{txn.customer?.phoneNumber || "N/A"}</td>
                    <td className="py-3 px-4">{txn.pump?.pumpName || "N/A"}</td>
                    <td className="py-3 px-4">₹{txn.amount}</td>
                    <td className="py-3 px-4">
                      {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-400">
                    No transactions found in this shift.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <SFooter />
    </div>
  );
}
