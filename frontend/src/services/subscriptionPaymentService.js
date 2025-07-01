import axios from 'axios';
import { BASE_URL } from '../utils/urls'

export const pumpSubscriptionAPI = async (pumpId) => {
    const token = sessionStorage.getItem("token")
    const response = await axios.post(`${BASE_URL}/pump-subscription`,
        { pumpId, paymentMethod: "pm_card_visa" },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
  return response.data;
};

