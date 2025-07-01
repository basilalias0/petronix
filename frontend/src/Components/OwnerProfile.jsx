import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, BadgeCheck } from "lucide-react";
import ONavbar from "./ONavbar";
import OFooter from "./OFooter";

export default function OwnerProfile() {
  const [owner, setOwner] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerProfile = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("Please log in to view your profile.");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/v1/pump-owner/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch owner profile.");
        }

        const data = await response.json();
        setOwner(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchOwnerProfile();
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
      <ONavbar />

      <header className="text-center py-20 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-xl">
        <h2 className="text-5xl font-extrabold text-white drop-shadow-lg">Owner Profile</h2>
        <p className="text-gray-300 mt-3 text-lg max-w-2xl mx-auto">
          Review and manage your personal information.
        </p>
      </header>

      <section className="p-10 flex justify-center">
        <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
              {owner?.profilePicture ? (
                <img
                  src={owner.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-purple-400" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-purple-400 mt-4">
              {owner ? `${owner.firstName} ${owner.lastName}` : "Unknown"}
            </h1>
            <p className="text-gray-400 capitalize">{owner?.role} | Status: {owner?.status}</p>
          </div>

          {/* Owner Details */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <DetailCard icon={Phone} label="Phone" value={owner?.phoneNumber || "Not available"} />
            <DetailCard icon={Mail} label="Email" value={owner?.email || "Not available"} />
            <DetailCard icon={Calendar} label="Aadhar Number" value={owner?.aadharNumber || "Not provided"} />
            <DetailCard
              icon={BadgeCheck}
              label="ID Proof"
              value={
                owner?.idProofPhoto ? (
                  <a
                    href={owner.idProofPhoto}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    View ID Proof
                  </a>
                ) : (
                  "Not uploaded"
                )
              }
            />
          </div>
        </div>
      </section>

      <OFooter />
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
