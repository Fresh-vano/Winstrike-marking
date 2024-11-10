import axios from 'axios';
import { REACT_APP_API_URL } from '@env';

const api = axios.create({
  baseURL: REACT_APP_API_URL || 'http://85.192.30.210:5000/api', 
});

export default api;
