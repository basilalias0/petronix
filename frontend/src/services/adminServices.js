import axios from 'axios'
import { BASE_URL } from '../utils/urls'


export const adminLoginAPI = async(data)=>{
    console.log("data",data);
    
    const response = await axios.post(`${BASE_URL}/auth/login`,data)
    return response.data
}