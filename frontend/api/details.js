// api/details.js
import api from './api';

export const addDetail = async (detailData) => {
  try {
    const response = await api.post('/details', detailData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при добавлении детали:', error);
    throw error;
  }
};
