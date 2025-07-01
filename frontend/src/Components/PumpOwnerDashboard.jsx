import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ONavbar from "./ONavbar";
import OFooter from "./OFooter";
import {
  Users,
  Fuel,
  CreditCard,
  BarChart3,
  Settings,
  FileText,
} from "lucide-react";

export default function PumpOwnerDashboard() {
  const [totalSales, setTotalSales] = useState(0);
  const [activeSalesReps, setActiveSalesReps] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [salesRes, repsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/v1/transcation/pie", { headers }),
          axios.get("http://localhost:5000/api/v1/pump-owner/active-sales-reps", { headers }),
        ]);

        setTotalSales(salesRes.data.grandTotalAmount || 0);
        setActiveSalesReps(repsRes.data.activeSalesReps || 0);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col bg-gray-900 text-white min-h-screen">
      <ONavbar />

      <div className="flex-1 flex flex-col">
        <header className="text-center py-10 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-lg">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            Welcome to Petronix
          </h1>
          <p className="text-gray-300 mt-3 text-lg max-w-xl mx-auto">
            Monitor pump operations and sales overview.
          </p>
        </header>

        <section className="flex flex-col items-center p-10 space-y-10 flex-1">
          {/* Overview Cards */}
          <div className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Total Sales", value: `₹${totalSales.toLocaleString()}` },
                { title: "Active Sales Reps", value: activeSalesReps },
              ].map((item, index) => (
                <div
                  key={index}
                  className="w-full h-36 bg-gradient-to-tr from-purple-700 to-indigo-800 p-5 rounded-xl shadow-md text-center flex flex-col justify-center items-center hover:scale-105 transition-transform"
                >
                  <h3 className="text-lg font-semibold text-gray-200">{item.title}</h3>
                  <p className="text-3xl font-bold mt-2 text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">Explore Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Manage Pumps",
                  description: "View and configure all your fuel pump details.",
                  icon: <Settings className="w-8 h-8 text-purple-400" />,
                  to: "/ManagePumps",
                },
                {
                  title: "Manage Sales Reps",
                  description: "Handle assignments, track performance, and more.",
                  icon: <Users className="w-8 h-8 text-purple-400" />,
                  to: "/ManageSalesReps",
                },
                {
                  title: "Payments",
                  description: "Oversee received and pending payments from customers.",
                  icon: <CreditCard className="w-8 h-8 text-purple-400" />,
                  to: "/OutstandingPayments",
                },
                {
                  title: "Fuel Sales",
                  description: "Track and monitor your pump’s daily fuel sales.",
                  icon: <Fuel className="w-8 h-8 text-purple-400" />,
                  to: "/FuelSalesTracking",
                },
                {
                  title: "Reports",
                  description: "Generate and review operational and financial reports.",
                  icon: <FileText className="w-8 h-8 text-purple-400" />,
                  to: "/ReportsAnalytics",
                },
                {
                  title: "Analytics",
                  description: "View performance trends to optimize operations.",
                  icon: <BarChart3 className="w-8 h-8 text-purple-400" />,
                  to: "/ReportsAnalytics",
                },
              ].map((feature, idx) => (
                <Link
                  to={feature.to}
                  key={idx}
                  className="bg-gray-900 p-4 rounded-xl border border-gray-700 hover:border-purple-500 transition duration-300 cursor-pointer"
                >
                  <div className="mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <OFooter />
    </div>
  );
}
