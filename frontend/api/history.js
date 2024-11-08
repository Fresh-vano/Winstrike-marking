// api/history.js
import axios from 'axios';

const API_BASE_URL = 'https://your-server.com/api';

export const fetchHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/history`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchHistoryDetail = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/history/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
