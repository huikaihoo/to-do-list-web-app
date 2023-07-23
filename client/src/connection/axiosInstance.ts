import axios from 'axios';
import Cookies from 'js-cookie';

// Set the base URL for your API server
const baseURL = 'http://localhost:3001'; // Replace with your actual API base URL

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 30_000, // milliseconds
});

// Add a request interceptor to include the token for authenticated endpoints (excluding login)
axiosInstance.interceptors.request.use(
  config => {
    const token = Cookies.get('token');
    if (token && !config.url?.endsWith('v1/auth/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
