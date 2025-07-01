import axios from 'axios';
import { BASE_URL } from '../utils/urls'

export const fetchDebtTransaction = async (data) => {
    const token = sessionStorage.getItem("token")
  const response = await axios.get(`${BASE_URL}/customer-credit-transaction`,{
    headers:{
        Authorization:`Bearer ${token}`
    }
  });
  return response.data;
};

export const fetchClientSecretAPI = async (amount,transactionId) => {
    const token = sessionStorage.getItem("token")
    const response = await axios.post(
        `http://localhost:5000/api/v1/customer-credit-transaction/pay-debt`,
        {
            amount,
            transactionId
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
  return response.data;
};


