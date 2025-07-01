import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";

export default function UserManagement() {
  const [owners, setOwners] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem("token");

  const fetchOwners = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/admin/pump-owners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOwners(res.data?.pumpOwners || []);
    } catch (err) {
      console.error("Failed to fetch pump owners:", err);
      setOwners([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/admin/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data?.customers || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setCustomers([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOwners(), fetchCustomers()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />

      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-purple-500">User View</h1>

        {/* Owners Section */}
        <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Owners</h2>
          {loading ? (
            <p className="text-gray-400">Loading owners...</p>
          ) : owners.length === 0 ? (
            <p className="text-gray-400">No pump owners found.</p>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-700">
                  <tr className="text-gray-300">
                    <th className="py-3 px-4 border-b">Name</th>
                    <th className="py-3 px-4 border-b">Email</th>
                    <th className="py-3 px-4 border-b">Phone</th>
                    <th className="py-3 px-4 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {owners.map((owner) => (
                    <tr key={owner._id} className="border-b border-gray-600">
                      <td className="py-3 px-4">
                        {owner.firstName} {owner.lastName}
                      </td>
                      <td className="py-3 px-4">{owner.email}</td>
                      <td className="py-3 px-4">{owner.phoneNumber || "N/A"}</td>
                      <td className="py-3 px-4">
                        <Link to={`/AdminsOwnerDetails/${owner._id}`}>
                          <button className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded">
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
        </div>

        {/* Customers Section */}
        <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Customers</h2>
          {loading ? (
            <p className="text-gray-400">Loading customers...</p>
          ) : customers.length === 0 ? (
            <p className="text-gray-400">No customers found.</p>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-700">
                  <tr className="text-gray-300">
                    <th className="py-3 px-4 border-b">Name</th>
                    <th className="py-3 px-4 border-b">Email</th>
                    <th className="py-3 px-4 border-b">Phone</th>
                    <th className="py-3 px-4 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id} className="border-b border-gray-600">
                      <td className="py-3 px-4">
                        {customer.firstName} {customer.lastName}
                      </td>
                      <td className="py-3 px-4">{customer.email}</td>
                      <td className="py-3 px-4">{customer.phoneNumber || "N/A"}</td>
                      <td className="py-3 px-4">
                        <Link to={`/AdminsCustomerDetails/${customer._id}`}>
                          <button className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded">
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
        </div>
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