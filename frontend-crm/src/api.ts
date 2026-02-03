import axios from 'axios';

const api = axios.create({
  // Si existe una variable de entorno usala, si no, usa localhost
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

export default api;