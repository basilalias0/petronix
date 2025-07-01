import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const AdminsOwnerDetails = () => {
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [pumps, setPumps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem('token');

  const fetchOwner = async () => {
    try {
      if (!token) {
        setError('Not authorized, please log in.');
        setLoading(false);
        return;
      }

      const { data } = await axios.get(
        `http://localhost:5000/api/v1/admin/pump-owners/${ownerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOwner(data);
    } catch (error) {
      console.error('Failed to fetch owner details:', error);
      setError('Failed to load owner details.');
      setOwner(null);
    }
  };

  const fetchPumps = async () => {
    try {
      if (!token || !ownerId) {
        return;
      }

      const { data } = await axios.get(
        `http://localhost:5000/api/v1/admin/pump-owners/${ownerId}/pumps?status=approved`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPumps(data.pumps || []);
      console.log('Pumps fetched:', data);
    } catch (error) {
      console.error('Failed to fetch pumps:', error);
      if (error.response && error.response.status === 404) {
        setPumps([]);
        console.log('No approved pumps found for ownerId:', ownerId);
      } else {
        setError((prevError) =>
          prevError ? `${prevError} Failed to load pumps.` : 'Failed to load pumps.'
        );
      }
    }
  };

  useEffect(() => {
    if (ownerId) {
      setLoading(true);
      Promise.all([fetchOwner(), fetchPumps()]).finally(() => setLoading(false));
    }
  }, [ownerId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <p className="text-gray-400 text-lg">Loading owner details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <p className="text-red-400 text-lg">Owner not found.</p>
      </div>
    );
  }

  const fullName = `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-semibold text-purple-500">
              Owner Registration Details
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Document ID: {owner._id || 'N/A'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="space-y-6">
            {/* Owner Information Section */}
            <section>
              <h2 className="text-lg font-medium text-white border-b border-gray-600 pb-2 mb-4">
                Owner Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Detail label="Full Name" value={fullName || 'N/A'} />
                <Detail label="Email" value={owner.email || 'N/A'} />
                <Detail label="Phone Number" value={owner.phoneNumber || 'N/A'} />
                <Detail label="Aadhar Number" value={owner.aadharNumber || 'N/A'} />
                <Detail
                  label="Account Created"
                  value={
                    owner.createdAt
                      ? new Date(owner.createdAt).toLocaleDateString()
                      : 'N/A'
                  }
                />
                <Detail
                  label="Status"
                  value={
                    <span
                      className={`capitalize ${
                        owner.status === 'approved'
                          ? 'text-green-400'
                          : owner.status === 'pending_approval'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {owner.status || 'N/A'}
                    </span>
                  }
                />
                <Detail
                  label="ID Proof"
                  value={
                    owner.idProofPhoto ? (
                      <a
                        href={owner.idProofPhoto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 underline"
                      >
                        View ID Proof
                      </a>
                    ) : (
                      'N/A'
                    )
                  }
                />
              </div>
            </section>

            {/* Approved Pumps Section */}
            <section>
              <h2 className="text-lg font-medium text-white border-b border-gray-600 pb-2 mb-4">
                Approved Pumps
              </h2>
              {pumps.length > 0 ? (
                <div className="space-y-4">
                  {pumps.map((pump) => (
                    <div
                      key={pump._id}
                      className="bg-gray-700 rounded-md p-4 border border-gray-600"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Detail label="Pump Name" value={pump.pumpName || 'N/A'} />
                        <Detail label="Location Name" value={pump.locationName || 'N/A'} />
                        <Detail label="City" value={pump.city || 'N/A'} />
                        <Detail label="License Number" value={pump.licenseNumber || 'N/A'} />
                        <Detail label="Manager Name" value={pump.managerName || 'N/A'} />
                        <Detail label="Manager Phone" value={pump.managerPhone || 'N/A'} />
                        <Detail
                          label="Status"
                          value={<span className="text-green-400">{pump.status || 'N/A'}</span>}
                        />
                        <Detail
                          label="Proof of License"
                          value={
                            pump.proofOfLicense ? (
                              <a
                                href={pump.proofOfLicense}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 underline"
                              >
                                View License
                              </a>
                            ) : (
                              'N/A'
                            )
                          }
                        />
                        <Detail
                          label="Manager ID Proof"
                          value={
                            pump.managerIdProof ? (
                              <a
                                href={pump.managerIdProof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 underline"
                              >
                                View ID Proof
                              </a>
                            ) : (
                              'N/A'
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No approved pumps available for this owner.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm font-medium text-gray-400">{label}</span>
    <span className="text-base text-white break-words">{value}</span>
  </div>
);

export default AdminsOwnerDetails;