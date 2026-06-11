import axios from 'axios';
import { getToken } from '../storage/token';

export const api = axios.create({
  baseURL: 'https://family-meds-api.onrender.com',
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});