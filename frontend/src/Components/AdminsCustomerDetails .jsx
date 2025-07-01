import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const AdminsCustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem('token');

  const fetchCustomer = async () => {
    try {
      if (!token) {
        setError('Not authorized, please log in.');
        setLoading(false);
        return;
      }

      const { data } = await axios.get(
        `http://localhost:5000/api/v1/admin/customers/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCustomer(data);
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      setError('Failed to load customer details.');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <p className="text-gray-400 text-lg">Loading customer details...</p>
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

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <p className="text-red-400 text-lg">Customer not found.</p>
      </div>
    );
  }

  const fullName = `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-semibold text-purple-500">
              Customer Registration Details
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
            Document ID: {customer._id || 'N/A'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="space-y-6">
            {/* Customer Information Section */}
            <section>
              <h2 className="text-lg font-medium text-white border-b border-gray-600 pb-2 mb-4">
                Customer Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Detail label="Full Name" value={fullName || 'N/A'} />
                <Detail label="Email" value={customer.email || 'N/A'} />
                <Detail label="Phone Number" value={customer.phoneNumber || 'N/A'} />
                <Detail label="Aadhar Number" value={customer.aadharNumber || 'N/A'} />
                <Detail label="Address" value={customer.address || 'N/A'} />
                <Detail
                  label="Account Created"
                  value={
                    customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString()
                      : 'N/A'
                  }
                />
                <Detail
                  label="Status"
                  value={
                    <span
                      className={customer.isBlacklisted ? 'text-red-400' : 'text-green-400'}
                    >
                      {customer.isBlacklisted ? 'Blacklisted' : 'Active'}
                    </span>
                  }
                />
                <Detail
                  label="ID Proof"
                  value={
                    customer.idProofPhoto ? (
                      <a
                        href={customer.idProofPhoto}
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

            {/* Credit Information Section */}
            <section>
              <h2 className="text-lg font-medium text-white border-b border-gray-600 pb-2 mb-4">
                Credit Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Detail label="Approved Credit" value={`₹${customer.credit ?? 0}`} />
                <Detail label="Credit Limit" value={`₹${customer.creditLimit ?? 0}`} />
                <Detail label="Payment Cycle" value={customer.paymentCycle || 'N/A'} />
                <Detail
                  label="Credit Suspended"
                  value={customer.isCreditSuspended ? 'Yes' : 'No'}
                />
                <Detail
                  label="Consecutive Payments"
                  value={customer.consecutivePayments ?? 'N/A'}
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

export default AdminsCustomerDetails;