import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slice/authslice";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navItems = [
    { name: "Dashboard", path: "/AdminDashboard" },
    { name: "User View", path: "/UserManagement" },
    { name: "Pump Management", path: "/PumpApproval" },
    { name: "Credit Management", path: "/CreditManagement" },
    { name: "Transaction Monitoring", path: "/TransactionMonitoring" },
    { name: "Credit Usage", path: "/SalesRevenueAnalytics" },
    
    // { name: "Settings", path: "/Settings" }
  ];

  const handleLogout = () => {
    dispatch(logout()); // Clear Redux auth state
    sessionStorage.removeItem("token"); // Changed to sessionStorage
    sessionStorage.removeItem("role");  // If role was stored
    navigate("/");
  };

  return (
    <aside className="w-64 bg-gray-800 p-5 flex flex-col justify-between min-h-screen">
      <div>
        <h2 className="text-2xl font-bold text-purple-500 mb-6">Petronix Admin</h2>
        <nav>
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`block px-4 py-2 rounded ${
                    location.pathname === item.path
                      ? "bg-purple-600"
                      : "hover:bg-purple-600"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-6 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
      >
        Logout
      </button>
    </aside>
  );
}
