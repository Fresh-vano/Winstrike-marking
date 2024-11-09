// api/history.js
import api from './api';

export const fetchHistory = async () => {
  try {
    const response = await api.get(`/history`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchHistoryDetail = async (id) => {
  try {
    const response = await api.get(`/history/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRecognition = async (id, data) => {
    const response = await api.put(`/history/${id}`, data);
    return response.data;
  };