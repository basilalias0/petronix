import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const AdminsCustomerCredit = () => {
  const { creditId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  const [customer, setCustomer] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!creditId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/v1/customer-credit-transaction/customer-credit/${creditId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCustomer(data.customer);
        setSelectedTransaction(data.selectedTransaction);
        setTransactions(data.transactions || []);
        setSummary({
          totalApprovedCredit: data.totalApprovedCredit,
          usedCredit: data.usedCredit,
          balanceCredit: data.balanceCredit,
          paybackDaysLeft: data.paybackDaysLeft,
        });
      } catch (error) {
        const msg = error?.response?.data?.message || error.message || 'Something went wrong.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [creditId, token]);

  const formatCurrency = (amt) => `₹${amt?.toFixed(2) || '0.00'}`;
  const formatDate = (date) => new Date(date).toLocaleDateString();
  const fullName = `${customer?.firstName ?? ''} ${customer?.lastName ?? ''}`.trim();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <p className="text-gray-400 text-lg">Loading credit details...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <p className="text-red-400 text-lg">{error || 'Customer not found.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-purple-500">Customer Credit Details</h1>
            <p className="text-sm text-gray-400 mt-1">Customer ID: {customer._id}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Customer Info */}
          <section>
            <h2 className="text-lg font-medium text-white border-b border-gray-600 pb-2 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Detail label="Full Name" value={fullName} />
              <Detail label="Email" value={customer.email} />
              <Detail label="Phone Number" value={customer.phoneNumber} />
              <Detail label="Aadhar Number" value={customer.aadharNumber} />
              <Detail label="Address" value={customer.address} />
              <Detail label="Account Created" value={formatDate(customer.createdAt)} />
              <Detail
                label="Status"
                value={
                  <span className={customer.isBlacklisted ? 'text-red-400' : 'text-green-400'}>
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

          {/* Credit Summary */}
          <section>
            <h2 className="text-lg font-medium text-white border-b border-gray-600 pb-2 mb-4">Credit Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Detail label="Total Approved Credit" value={formatCurrency(summary.totalApprovedCredit)} />
              <Detail label="Used Credit" value={formatCurrency(summary.usedCredit)} />
              <Detail label="Balance Credit" value={formatCurrency(summary.balanceCredit)} />
              <Detail label="Payback Period Remaining" value={`${summary.paybackDaysLeft} days`} />
            </div>
          </section>

          {/* Selected Transaction */}
          <section>
            <h2 className="text-lg font-medium text-white border-b border-gray-600 pb-2 mb-4">
              Selected Credit Transaction
            </h2>
            {selectedTransaction ? (
              <TransactionCard
                txn={selectedTransaction}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                isHighlighted
              />
            ) : (
              <p className="text-gray-400">No transaction found for this credit ID.</p>
            )}
          </section>

          {/* All Transactions */}
          <section>
            <h2 className="text-lg font-medium text-white border-b border-gray-600 pb-2 mb-4">
              All Credit Transactions
            </h2>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((txn) => (
                  <TransactionCard
                    key={txn._id}
                    txn={txn}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    isHighlighted={txn._id === selectedTransaction?._id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No credit transactions available.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm font-medium text-gray-400">{label}</span>
    <span className="text-base text-white break-words">{value ?? 'N/A'}</span>
  </div>
);

const TransactionCard = ({ txn, formatCurrency, formatDate, isHighlighted }) => {
  const statusColor = {
    approved: 'text-green-400',
    pending: 'text-yellow-400',
    rejected: 'text-red-400',
  };

  return (
    <div className={`p-4 border rounded-md ${isHighlighted ? 'border-purple-500 bg-gray-700' : 'border-gray-600 bg-gray-700'}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Detail label="Transaction ID" value={txn.transactionId || txn._id} />
        <Detail label="Amount" value={formatCurrency(txn.amount)} />
        <Detail
          label="Status"
          value={
            <span className={statusColor[txn.creditRequestStatus] || 'text-white'}>
              {txn.creditRequestStatus?.charAt(0).toUpperCase() + txn.creditRequestStatus?.slice(1)}
            </span>
          }
        />
        <Detail label="Date" value={formatDate(txn.transactionDate || txn.createdAt)} />
      
      </div>
    </div>
  );
};

export default AdminsCustomerCredit;
