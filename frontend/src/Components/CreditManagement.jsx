import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import axios from "axios";

export default function CreditManagement() {
  const [approvedCredits, setApprovedCredits] = useState([]);
  const [pendingPaybacks, setPendingPaybacks] = useState([]);
  const [loadingStates, setLoadingStates] = useState({}); // Track loading per button
  const pendingTableRef = useRef(null); // Ref to track pending paybacks table container

  useEffect(() => {
    fetchApprovedCredits();
    fetchPendingPaybacks();
  }, []);

  useEffect(() => {
    console.log("Approved Credits:", approvedCredits);
    console.log("Pending Paybacks:", pendingPaybacks);
  }, [approvedCredits, pendingPaybacks]);

  const fetchApprovedCredits = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/v1/customer-credit-transaction", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("API Response (Approved Credits):", response.data);

      if (Array.isArray(response.data.creditTransactions)) {
        const approvedCreditsData = response.data.creditTransactions.filter(
          (credit) => credit.creditRequestStatus === "approved"
        );
        console.log("Filtered Approved Credits:", approvedCreditsData);
        setApprovedCredits(approvedCreditsData);
      } else {
        console.error("Expected an array of credits, but received:", response.data.creditTransactions);
      }
    } catch (error) {
      console.error("Error fetching approved credits:", error);
    }
  };

  const fetchPendingPaybacks = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/v1/customer-credit-transaction", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data.creditTransactions)) {
        const pendingPaybacksData = response.data.creditTransactions.filter(
          (credit) => credit.paymentStatus === "pending"
        );
        console.log("Filtered Pending Paybacks:", pendingPaybacksData);
        setPendingPaybacks(pendingPaybacksData);
      } else {
        console.error("Expected an array of credits, but received:", response.data.creditTransactions);
      }
    } catch (error) {
      console.error("Error fetching pending paybacks:", error);
    }
  };

  const handleSendReminder = async (id, email, amount, e) => {
    e.preventDefault(); // Prevent default button behavior
    e.stopPropagation(); // Stop event bubbling
    const scrollPosition = pendingTableRef.current?.scrollTop || 0; // Save current scroll position

    setLoadingStates((prev) => ({ ...prev, [id]: true }));
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/v1/admin/send-payment-reminder`,
        { transactionId: id, email, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || `Reminder sent to ${email}`);
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert(error.response?.data?.error || 'Failed to send reminder email.');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
      // Restore scroll position after state update
      if (pendingTableRef.current) {
        pendingTableRef.current.scrollTop = scrollPosition;
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-purple-500">Credit Management</h1>

        {/* Approved Credits Table */}
        <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">Approved Credits</h2>
          <div className="overflow-auto max-h-[320px] w-full">
            <table className="min-w-[800px] w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-700 text-gray-300 z-10">
                <tr>
                  <th className="py-3 px-4 border-b">Name</th>
                  <th className="py-3 px-4 border-b">Email</th>
                  <th className="py-3 px-4 border-b">Amount</th>
                  <th className="py-3 px-4 border-b">Details</th>
                </tr>
              </thead>
              <tbody>
                {approvedCredits.length > 0 ? (
                  approvedCredits.map((credit) => (
                    <tr key={credit._id} className="border-b border-gray-600">
                      <td className="py-3 px-4">
                        {`${credit.customer?.firstName || ""} ${credit.customer?.lastName || ""}`.trim() || "Unknown Name"}
                      </td>
                      <td className="py-3 px-4">
                        {credit.customer?.email || "No Email"}
                      </td>
                      <td className="py-3 px-4">₹{credit.amount || 0}</td>
                      <td className="py-3 px-4">
                        <Link to={`/AdminsCustomerCredit/${credit._id}`}>
                          <button className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded">
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-400">
                      No approved credits.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Payback Credits Table */}
        <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
            Pending Payback Credits
          </h2>
          <div className="overflow-auto max-h-[320px] w-full" ref={pendingTableRef}>
            <table className="min-w-[800px] w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-700 text-gray-300 z-10">
                <tr>
                  <th className="py-3 px-4 border-b">Name</th>
                  <th className="py-3 px-4 border-b">Email</th>
                  <th className="py-3 px-4 border-b">Amount</th>
                  <th className="py-3 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPaybacks.length > 0 ? (
                  pendingPaybacks.map((credit) => (
                    <tr key={credit._id} className="border-b border-gray-600">
                      <td className="py-3 px-4">
                        {`${credit.customer?.firstName || ""} ${credit.customer?.lastName || ""}`.trim() || "Unknown Name"}
                      </td>
                      <td className="py-3 px-4">
                        {credit.customer?.email || "No Email"}
                      </td>
                      <td className="py-3 px-4">₹{credit.amount || 0}</td>
                      <td className="py-3 px-4">
                        <button
                          className="relative bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded flex items-center justify-center disabled:opacity-50"
                          onClick={(e) =>
                            handleSendReminder(
                              credit._id,
                              credit.customer?.email || "no-email@unknown.com",
                              credit.amount,
                              e
                            )
                          }
                          disabled={loadingStates[credit._id]}
                        >
                          {loadingStates[credit._id] ? (
                            <>
                              <span className="mr-2">Sending...</span>
                              <div className="w-4 h-4 border-2 border-yellow-200 border-t-yellow-600 rounded-full animate-spin"></div>
                            </>
                          ) : (
                            "Send Reminder"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-400">
                      No pending paybacks.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}