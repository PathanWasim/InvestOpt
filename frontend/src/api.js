import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

export const getDatasets = () => api.get('/datasets');
export const getDataset = (name) => api.get(`/datasets/${name}`);

export const runAlgorithm = (payload) => api.post('/run', payload);
export const compareAlgorithms = (payload) => api.post('/compare', payload);
export const healthCheck = () => api.get('/health');

export default api;
