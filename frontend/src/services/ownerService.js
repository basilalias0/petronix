// services/ownerService.js
import axios from 'axios';

export const registerPumpOwnerAPI = async (data) => {
  const response = await axios.post('http://localhost:5000/api/v1/pump-owner/register', data);
  return response.data;
};
