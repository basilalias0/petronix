import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const AdminsPumpsDetails = () => {
  const { pumpId } = useParams();
  const navigate = useNavigate();
  const [pump, setPump] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem('token');

  const fetchPump = async () => {
    try {
      if (!token) {
        setError('Not authorized, please log in.');
        setLoading(false);
        return;
      }

      const { data } = await axios.get(
        `http://localhost:5000/api/v1/pump/${pumpId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPump(data);
    } catch (error) {
      console.error('Failed to fetch pump details:', error);
      setError('Failed to load pump details.');
      setPump(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pumpId) {
      fetchPump();
    }
  }, [pumpId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <p className="text-gray-400 text-lg">Loading pump details...</p>
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

  if (!pump) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <p className="text-red-400 text-lg">Pump not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-semibold text-purple-500">
              Pump Registration Details
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
            Document ID: {pump._id || 'N/A'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="space-y-6">
            {/* Pump Information Section */}
            <section>
              <h2 className="text-lg font-medium text-white border-b border-gray-600 pb-2 mb-4">
                Pump Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Detail label="Pump Name" value={pump.pumpName || 'N/A'} />
                <Detail label="Location Name" value={pump.locationName || 'N/A'} />
                <Detail label="City" value={pump.city || 'N/A'} />
                <Detail label="District" value={pump.district || 'N/A'} />
              </div>
            </section>

            {/* Owner Information Section */}
            <section>
              <h2 className="text-lg font-medium text-white border-b border-gray-600 pb-2 mb-4">
                Owner Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Detail
                  label="Owner Name"
                  value={
                    pump.pumpOwner
                      ? `${pump.pumpOwner.firstName || ''} ${pump.pumpOwner.lastName || ''}`.trim() ||
                        'N/A'
                      : 'N/A'
                  }
                />
                <Detail
                  label="Owner Email"
                  value={pump.pumpOwner?.email || 'N/A'}
                />
              </div>
            </section>

            {/* License Information Section */}
            <section>
              <h2 className="text-lg font-medium text-white border-b border-gray-600 pb-2 mb-4">
                License Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Detail label="License Number" value={pump.licenseNumber || 'N/A'} />
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
              </div>
            </section>

            {/* Manager Information Section */}
            <section>
              <h2 className="text-lg font-medium text-white border-b border-gray-600 pb-2 mb-4">
                Manager Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Detail label="Manager Name" value={pump.managerName || 'N/A'} />
                <Detail label="Manager Phone" value={pump.managerPhone || 'N/A'} />
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
            </section>

            {/* Status Information Section */}
            <section>
              <h2 className="text-lg font-medium text-white border-b border-gray-600 pb-2 mb-4">
                Status Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Detail label="Status" value={pump.status || 'N/A'} />
                <Detail
                  label="Registered At"
                  value={
                    pump.createdAt
                      ? new Date(pump.createdAt).toLocaleString()
                      : 'N/A'
                  }
                />
              </div>
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

export default AdminsPumpsDetails;