import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, MapPin, Edit } from "lucide-react";
import CNavbar from "./CNavbar";
import CFooter from "./CFooter";

export default function UserProfile() {
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("Please log in to view your profile.");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/v1/customer/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch customer profile.");
        }

        const data = await response.json();
        setCustomer(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCustomerProfile();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-400">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <CNavbar />

      <header className="text-center py-20 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-xl">
        <h2 className="text-5xl font-extrabold text-white drop-shadow-lg">User Profile</h2>
        <p className="text-gray-300 mt-3 text-lg max-w-2xl mx-auto">
          Manage your account information and preferences.
        </p>
      </header>

      <section className="p-10 flex justify-center">
        <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
              {customer?.profilePicture ? (
                <img
                  src={customer.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-purple-400" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-purple-400 mt-4">
              {customer ? `${customer.firstName} ${customer.lastName}` : "Unknown"}
            </h1>
            <p className="text-gray-400">{customer?.role || "Role not set"} | Petronix</p>
          </div>

          {/* Personal Details */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <DetailCard icon={Phone} label="Phone" value={customer?.phoneNumber || "Phone not available"} />
            <DetailCard icon={Mail} label="Email" value={customer?.email || "Email not available"} />
            <DetailCard icon={Calendar} label="Adhar" value={customer?.aadharNumber || "Adhar not provided"} />
            <DetailCard icon={MapPin} label="Address" value={customer?.address || "Address not provided"} />
          </div>

          {/* Credit Information */}
          <div className="mt-10 text-left">
            <h2 className="text-xl font-semibold text-purple-400 mb-4">Credit Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard label="Approved Credit" value={`₹${customer?.credit ?? 0}`} />
              <DetailCard label="Credit Limit" value={`₹${customer?.creditLimit ?? 0}`} />
              <DetailCard label="Payment Cycle" value={customer?.paymentCycle || "N/A"} />
              <DetailCard label="Credit Suspended" value={customer?.isCreditSuspended ? "Yes" : "No"} />
              <DetailCard label="Consecutive Payments" value={customer?.consecutivePayments ?? "N/A"} />
              <DetailCard
                label="ID Proof"
                value={
                  customer?.idProofPhoto ? (
                    <a
                      href={customer.idProofPhoto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline"
                    >
                      View ID Proof
                    </a>
                  ) : (
                    "N/A"
                  )
                }
              />
            </div>
          </div>

          {/* <div className="mt-10 flex justify-center">
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg flex items-center space-x-2">
              <Edit className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
          </div> */}
        </div>
      </section>

      <CFooter />
    </div>
  );
}

const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-start space-x-4">
    {Icon && <Icon className="w-6 h-6 text-purple-400 mt-1" />}
    <div>
      <h3 className="text-sm font-medium text-gray-400">{label}</h3>
      <p className="text-base text-white">{value}</p>
    </div>
  </div>
);
