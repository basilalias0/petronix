import { useState, useEffect } from "react";
import axios from "axios";
import CNavbar from "./CNavbar";
import CFooter from "./CFooter";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  // Function to mark a notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/v1/notification/read/${notificationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update local state to reflect the change
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/v1/notification/user?userType=${role}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            params: {
              page,
              limit: 10,
            },
          }
        );

        setNotifications(res.data.notifications || []); // Ensure it is an array
        setTotalPages(Math.ceil(res.data.total / 10)); // Calculate total pages
      } catch (err) {
        setError("Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [page]);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <CNavbar />

      {/* Hero Section */}
      <header className="text-center py-20 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-xl">
        <h2 className="text-5xl font-extrabold text-white drop-shadow-lg">Notifications</h2>
        <p className="text-gray-300 mt-3 text-lg max-w-2xl mx-auto">
          Stay updated with important alerts.
        </p>
      </header>

      {/* Content Section */}
      <section className="flex flex-col items-center p-10 space-y-10">
        {/* Notifications List */}
        <div className="w-full max-w-6xl bg-gray-800 shadow-lg rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-purple-400 text-center mb-6">Recent Alerts</h2>

          {/* Loading or Error handling */}
          {loading ? (
            <p className="text-center text-lg text-gray-400">Loading notifications...</p>
          ) : error ? (
            <p className="text-center text-lg text-red-500">{error}</p>
          ) : (
            <ul className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <li
                  key={notification._id}
                  onClick={() => markNotificationAsRead(notification._id)} // Call markRead when clicked
                  className={`p-4 rounded-lg text-lg font-semibold flex items-center justify-between shadow-md ${
                    notification.read
                      ? "bg-gray-700 text-gray-500" // For read notifications
                      : notification.type === "success"
                      ? "bg-green-600 text-white" // For success notifications
                      : notification.type === "warning"
                      ? "bg-yellow-600 text-gray-900" // For warning notifications
                      : "bg-blue-600 text-white" // For other notifications
                  }`}
                >
                  {notification.message}
                </li>
              ))
            ) : (
              <li className="text-center text-lg text-gray-400">No notifications available</li>
            )}
          </ul>
          
          )}

          {/* Pagination */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="bg-purple-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-white">{`Page ${page} of ${totalPages}`}</span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="bg-purple-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <CFooter />
    </div>
  );
}
