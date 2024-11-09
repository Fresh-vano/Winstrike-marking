// api/stats.js
import api from './api';

export const fetchStats = async () => {
  try {
    const response = await api.get(`/stats`);
    return response.data;
  } catch (error) {
    throw error;
  }
};