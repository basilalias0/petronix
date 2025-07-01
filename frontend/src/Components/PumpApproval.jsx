import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import axios from "axios";

export default function PumpApproval() {
  const [pendingPumps, setPendingPumps] = useState([]);
  const [approvedPumps, setApprovedPumps] = useState([]);
  const [rejectedPumps, setRejectedPumps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(null); // Track which pump is being approved

  useEffect(() => {
    fetchAllPumps();
  }, []);

  const fetchAllPumps = async () => {
    try {
      const token = sessionStorage.getItem("token");
      let allPumps = [];
      let page = 1;

      while (true) {
        const response = await axios.get(
          `http://localhost:5000/api/v1/pump-owner/pumps?page=${page}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const pumpsData = response.data?.pumps || [];
        if (pumpsData.length === 0) break;
        allPumps = [...allPumps, ...pumpsData];
        page++;
      }

      setPendingPumps(allPumps.filter((pump) => pump.status === "pending_approval"));
      setApprovedPumps(allPumps.filter((pump) => pump.status === "approved"));
      setRejectedPumps(allPumps.filter((pump) => pump.status === "rejected"));
    } catch (error) {
      console.error("❌ Error fetching pumps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setIsApproving(id);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/v1/pump/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedPump = res.data.pump;
      if (!updatedPump) return;

      setPendingPumps((prev) => prev.filter((pump) => pump._id !== id));
      setApprovedPumps((prev) => [...prev, updatedPump]);
      alert("Pump approved successfully!");
    } catch (error) {
      console.error("❌ Error approving pump:", error);
      alert("Error approving pump. Please try again.");
    } finally {
      setIsApproving(null);
    }
  };

  const handleReject = async (id) => {
    try {
      const reason = prompt("Enter rejection reason:");
      if (!reason) return;

      const token = sessionStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/v1/pump/reject/${id}`,
        { rejectionReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchAllPumps();
    } catch (error) {
      console.error("❌ Error rejecting pump:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-purple-500">Pump Approval</h1>

        {loading ? (
          <p className="mt-6 text-gray-400">Loading pumps...</p>
        ) : (
          <>
            {/* Pending Pumps */}
            <section className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-yellow-400 mb-4">Pending Pump Requests</h2>
              {pendingPumps.length === 0 ? (
                <p className="text-gray-400">No pending pumps.</p>
              ) : (
                <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-700">
                      <tr className="text-gray-300">
                        <th className="py-3 px-4 border-b">Pump Name</th>
                        <th className="py-3 px-4 border-b">Location</th>
                        <th className="py-3 px-4 border-b">Owner</th>
                        <th className="py-3 px-4 border-b text-center">Actions</th>
                        <th className="py-3 px-4 border-b text-center">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPumps.map((pump) => (
                        <tr key={pump?._id} className="border-b border-gray-600">
                          <td className="py-3 px-4">{pump?.pumpName || "Unnamed"}</td>
                          <td className="py-3 px-4">{pump?.locationName || "Unknown"}</td>
                          <td className="py-3 px-4">
                            {pump?.pumpOwner
                              ? `${pump.pumpOwner.firstName || ""} ${pump.pumpOwner.lastName || ""}`
                              : "N/A"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              className={`bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm flex items-center justify-center mx-auto w-24 ${
                                isApproving === pump._id ? "cursor-not-allowed" : ""
                              }`}
                              onClick={() => handleApprove(pump._id)}
                              disabled={isApproving === pump._id}
                            >
                              {isApproving === pump._id ? (
                                <svg
                                  className="w-4 h-4 animate-spin text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                  />
                                </svg>
                              ) : (
                                "Approve"
                              )}
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm w-24 mt-2 mx-auto"
                              onClick={() => handleReject(pump._id)}
                            >
                              Reject
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link to={`/AdminsPumpsDetails/${pump?._id}`}>
                              <button className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm w-24">
                                View
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Approved Pumps */}
            <section className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-green-400 mb-4">Approved Pumps</h2>
              {approvedPumps.length === 0 ? (
                <p className="text-gray-400">No approved pumps.</p>
              ) : (
                <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-700">
                      <tr className="text-gray-300">
                        <th className="py-3 px-4 border-b">Pump Name</th>
                        <th className="py-3 px-4 border-b">Location</th>
                        <th className="py-3 px-4 border-b">Owner</th>
                        <th className="py-3 px-4 border-b text-center">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedPumps.map((pump) => (
                        <tr key={pump?._id} className="border-b border-gray-600">
                          <td className="py-3 px-4">{pump?.pumpName || "Unnamed"}</td>
                          <td className="py-3 px-4">{pump?.locationName || "Unknown"}</td>
                          <td className="py-3 px-4">
                            {pump?.pumpOwner
                              ? `${pump.pumpOwner.firstName || ""} ${pump.pumpOwner.lastName || ""}`
                              : "N/A"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link to={`/AdminsPumpsDetails/${pump?._id}`}>
                              <button className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm w-24">
                                View
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Rejected Pumps */}
            <section className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-red-400 mb-4">Rejected Pumps</h2>
              {rejectedPumps.length === 0 ? (
                <p className="text-gray-400">No rejected pumps.</p>
              ) : (
                <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-700">
                      <tr className="text-gray-300">
                        <th className="py-3 px-4 border-b">Pump Name</th>
                        <th className="py-3 px-4 border-b">Location</th>
                        <th className="py-3 px-4 border-b">Owner</th>
                        <th className="py-3 px-4 border-b">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rejectedPumps.map((pump) => (
                        <tr key={pump?._id} className="border-b border-gray-600">
                          <td className="py-3 px-4">{pump?.pumpName || "Unnamed"}</td>
                          <td className="py-3 px-4">{pump?.locationName || "Unknown"}</td>
                          <td className="py-3 px-4">
                            {pump?.pumpOwner
                              ? `${pump.pumpOwner.firstName || ""} ${pump.pumpOwner.lastName || ""}`
                              : "N/A"}
                          </td>
                          <td className="py-3 px-4">{pump?.rejectionReason || "No reason provided"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1f2937; /* Matches bg-gray-800 for a cohesive look */
            border-radius: 4px;
            margin: 4px 0;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #a855f7, #7e22ce); /* Purple gradient to match text-purple-500 */
            border-radius: 4px;
            border: 1px solid #374151; /* Subtle border to enhance contrast */
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #9333ea, #6b21a8); /* Darker purple on hover */
          }
          .custom-scrollbar {
            scrollbar-width: thin; /* For Firefox */
            scrollbar-color: #a855f7 #1f2937; /* Thumb and track colors for Firefox */
          }
        `}
      </style>
    </div>
  );
}