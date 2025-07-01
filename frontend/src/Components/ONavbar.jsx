import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slice/authslice"; // Redux logout action

export default function ONavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    dispatch(logout()); // Clear Redux authentication state
    sessionStorage.removeItem("token"); // <-- Changed to sessionStorage
    sessionStorage.removeItem("role");  // <-- Changed to sessionStorage
    navigate("/"); // Redirect to login page
  };

  return (
    <nav className="bg-black p-4 flex justify-between items-center">
      {/* Logo */}
      <h1 className="text-yellow-400 text-2xl font-bold">PETRONIX</h1>

      {/* Navigation Links */}
      <ul className="flex space-x-6 text-white">
        <li>
          <Link to="/PumpOwnerDashboard" className="hover:text-purple-400">Home</Link>
        </li>
        <li>
          <Link to="/ManagePumps" className="hover:text-purple-400">Manage Pumps</Link>
        </li>
        <li>
          <Link to="/ManageSalesReps" className="hover:text-purple-400">Manage Sales Reps</Link>
        </li>
        <li>
          <Link to="/OutstandingPayments" className="hover:text-purple-400">Payments</Link>
        </li>
        <li>
          <Link to="/FuelSalesTracking" className="hover:text-purple-400">Fuel Sales</Link>
        </li>
        <li>
          <Link to="/ReportsAnalytics" className="hover:text-purple-400">Reports</Link>
        </li>
      </ul>

      {/* Profile & Logout Buttons */}
      <div className="flex space-x-4">
        <Link to="/OwnerProfile" className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg text-white">
          View Profile
        </Link>
        <button 
          onClick={handleLogout} 
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}
