// api/stats.js
import axios from 'axios';

const API_BASE_URL = 'https://your-server.com/api';

export const fetchStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
