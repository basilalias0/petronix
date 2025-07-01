import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function ReportGeneration() {
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState("financial");

  useEffect(() => {
    const hash = location.hash.substring(1) || "financial";
    setCurrentTab(hash);
  }, [location]);

  function renderContent() {
    switch (currentTab) {
      case "financial":
        return <p className="text-lg">Financial Reports Content</p>;
      case "operational":
        return <p className="text-lg">Operational Reports Content</p>;
      case "sales":
        return <p className="text-lg">Sales Reports Content</p>;
      case "transactions":
        return <p className="text-lg">Transaction Reports Content</p>;
      default:
        return <p className="text-lg">Select a report type</p>;
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      {/* <aside className="w-64 p-6 bg-gray-800 shadow-md h-screen">
        <h2 className="text-xl font-bold text-purple-500 mb-4">Petronix Admin</h2>
        <nav className="space-y-2">
        <ul className="space-y-4">
            <li><Link to="/AdminDashboard" className="block px-4 py-2 hover:bg-purple-600 rounded">Dashboard</Link></li>
            <li><Link to="/UserManagement" className="block px-4 py-2 rounded hover:bg-purple-600">User Management</Link></li>
            <li><Link to="/CreditManagement" className="block px-4 py-2 rounded hover:bg-purple-600">Credit Management</Link></li>
            <li><Link to="/TransactionMonitoring" className="block px-4 py-2 rounded bg-purple-600">Transaction Monitoring</Link></li>
            <li><Link to="/SalesRevenueAnalytics" className="block px-4 py-2 rounded hover:bg-purple-600">Sales & Revenue Analytics</Link></li>
            <li><Link to="/ReportGeneration" className="block px-4 py-2 rounded hover:bg-purple-600">Report Generation</Link></li>
            <li><Link to="/Settings" className="block px-4 py-2 rounded hover:bg-purple-600">Settings</Link></li>
          </ul>
        </nav>
      </aside> */}

      <Sidebar/>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-purple-500">Report Generation</h1>
        <nav className="flex space-x-4 mt-6 bg-gray-800 p-4 rounded-lg shadow-md">
          <Link to="#financial" className={`px-4 py-2 rounded ${currentTab === "financial" ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}>Financial Reports</Link>
          <Link to="#operational" className={`px-4 py-2 rounded ${currentTab === "operational" ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}>Operational Reports</Link>
          <Link to="#sales" className={`px-4 py-2 rounded ${currentTab === "sales" ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}>Sales Reports</Link>
          <Link to="#transactions" className={`px-4 py-2 rounded ${currentTab === "transactions" ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}>Transaction Reports</Link>
        </nav>
        <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-md">
          {renderContent()}
          <div className="mt-4 space-x-4">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Export as Excel</button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Export as PDF</button>
          </div>
        </div>
      </main>
    </div>
  );
}
