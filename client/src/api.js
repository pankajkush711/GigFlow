import axios from 'axios';

// Use Vite env if provided, otherwise fall back to local backend
const baseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});
