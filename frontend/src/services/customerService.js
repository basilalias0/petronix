// services/customerService.js
import axios from 'axios';

export const registerCustomerAPI = async (data) => {
  const response = await axios.post('http://localhost:5000/api/v1/customer/register', data);
  return response.data;
};

// Fetch credit transactions
export const fetchCreditTransactionsAPI = async () => {
  const token = sessionStorage.getItem('token');
  const response = await axios.get('http://localhost:5000/api/v1/customer-credit-transaction', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Submit credit request
export const submitCreditRequestAPI = async (amount) => {
  const token = sessionStorage.getItem('token');
  const response = await axios.post(
    'http://localhost:5000/api/v1/customer-credit-transaction',
    { amount },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};


// Fetch credit data (approved credit, used credit, etc.)
export const fetchCreditDataAPI = async () => {
  const token = sessionStorage.getItem('token');
  const response = await axios.get('http://localhost:5000/api/v1/customer-credit-transaction', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const fetchDebtTransaction = async () => {
  const token = sessionStorage.getItem("token");

  const response = await axios.get(
    "http://localhost:5000/api/v1/customer-credit-transaction",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

export const fetchCustomerTransactions = async () => {
  const token = sessionStorage.getItem("token");

  const response = await axios.get(
    "http://localhost:5000/api/v1/transcation/customer",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const allTxns = [
    ...response.data.pumpTransactions,
    ...response.data.adminTransactions,
  ];

  const sorted = allTxns.sort((a, b) =>
    new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
  );

  return sorted;
};


// src/services/pumpApi.js

export const fetchNearbyPumps = async (lat, lng, token) => {
  try {
    const response = await fetch(`http://localhost:5000/api/v1/pump/nearby?lat=${lat}&lng=${lng}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch nearby pumps');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetchNearbyPumps:", error);
    throw error;
  }
};
