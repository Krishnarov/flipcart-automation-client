import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add request interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);

export const uploadExcel = (formData, type = 'purchase') => {
  formData.append('type', type);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getJobs = (type = '') => api.get(`/report/jobs${type ? `?type=${type}` : ''}`);
export const getJobTasks = (jobId) => api.get(`/report/jobs/${jobId}`);
export const getStats = () => api.get('/report/stats');
export const startJob = (jobId) => api.post(`/automation/start/${jobId}`);
export const retryJob = (jobId) => api.post(`/automation/retry-job/${jobId}`);
export const retryTask = (taskId, type) => api.post(`/automation/retry-task/${taskId}?type=${type}`);

export default api;
