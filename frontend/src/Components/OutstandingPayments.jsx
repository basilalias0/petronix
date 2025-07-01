import { useState, useEffect } from "react";
import axios from "axios";
import ONavbar from "./ONavbar";
import OFooter from "./OFooter";

export default function OutstandingPayments() {
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPayments = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/v1/transcation/recent-payments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFilteredPayments(response.data);
      } catch (error) {
        console.error("Error fetching recent payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPayments();
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col">
      <ONavbar />
      <header className="text-center py-10 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-lg">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
          Recent Payments (Last 1 Hour)
        </h1>
        <p className="text-gray-300 mt-3 text-lg max-w-xl mx-auto">
          Review payments completed within the last hour.
        </p>
      </header>

      <section className="flex justify-center p-10 flex-1">
        <div className="w-full max-w-6xl bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold mb-6 text-purple-300">
            Recent Payments
          </h2>

          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-left border-collapse text-lg">
              <thead>
                <tr className="border-b border-gray-700 text-purple-300">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Fuel Type</th>
                  <th className="py-3 px-4">Payment Type</th>
                  <th className="py-3 px-4">Transaction Time</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="py-3 px-4">
                        {payment.customerName?.toUpperCase() || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-red-400">
                        ₹{payment.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-blue-300">
                        {payment.fuelType || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-yellow-300">
                        {payment.paymentType || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(payment.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-400">
                        Paid
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-400">
                      No payments in the last hour.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <OFooter />
    </div>
  );
}
