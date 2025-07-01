import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { Bell } from "lucide-react";
import { logout } from "../redux/slice/authslice"; // Redux logout action

export default function CNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);


  // Handle logout
  const handleLogout = () => {
    dispatch(logout()); // Clear Redux authentication state
    sessionStorage.removeItem("token"); // Changed to sessionStorage
    sessionStorage.removeItem("role");  // Changed to sessionStorage
    navigate("/"); // Redirect to login page
  };
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = sessionStorage.getItem("token");
      const role = sessionStorage.getItem("role");

      if (!token || !role) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/v1/notification/unread-count?userType=${role}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(res.data.unreadCount);
      } catch (err) {
        console.error("Error fetching unread count", err);
      }
    };

    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-black p-4 flex justify-between items-center">
      {/* Logo */}
      <h1 className="text-yellow-400 text-2xl font-bold">PETRONIX</h1>

      {/* Navigation Links */}
      <ul className="flex space-x-6 text-white">
        <li><Link to="/CustomerDashboard" className="hover:text-purple-400">Home</Link></li>
        <li><Link to="/CreditRequest" className="hover:text-purple-400">Credit Request</Link></li>
        <li><Link to="/CreditBalance" className="hover:text-purple-400">Credit Balance</Link></li>
        <li><Link to="/Payment" className="hover:text-purple-400">Payment</Link></li>
        <li><Link to="/FuelingHistory" className="hover:text-purple-400">Fueling History</Link></li>
        <li><Link to="/FindPetrolPumps" className="hover:text-purple-400">Find Petrol Pumps</Link></li>
        <li className="relative">
          <Link to="/Notifications" className="hover:text-purple-400 flex items-center relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-xs text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>
        </li>

      </ul>

      {/* Profile & Logout Buttons */}
      <div className="flex space-x-4">
        <Link to="/UserProfile" className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg text-white">
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
