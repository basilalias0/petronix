import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slice/authslice";

export default function SNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    navigate("/", { replace: true }); // Prevent back nav
  };

  return (
    <nav className="bg-black p-4 flex justify-between items-center">
      <h1 className="text-yellow-400 text-2xl font-bold">PETRONIX</h1>
      <ul className="flex space-x-6">
        <li><Link to="/SalesRepDashboard" className="hover:text-purple-400">Home</Link></li>
        <li><Link to="/ProcessFueling" className="hover:text-purple-400">Process Fueling</Link></li>
        <li><Link to="/TransactionHistory" className="hover:text-purple-400">Transaction History</Link></li>
      </ul>
      <div className="flex space-x-4">
        
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
