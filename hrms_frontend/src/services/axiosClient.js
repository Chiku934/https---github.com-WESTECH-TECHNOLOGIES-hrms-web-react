import axios from 'axios';

// Create axios instance with default config
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add company context if available
    const companyId = localStorage.getItem('companyId');
    if (companyId) {
      config.headers['X-Company-Id'] = companyId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosClient.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Call refresh token endpoint
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/refresh`,
            { refresh_token: refreshToken }
          );
          
          const { access_token, refresh_token } = response.data.data;
          
          // Update tokens in storage
          localStorage.setItem('accessToken', access_token);
          localStorage.setItem('refreshToken', refresh_token);
          
          // Update the original request header
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          // Retry the original request
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('companyId');
        localStorage.removeItem('user');
        
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      console.error('Permission denied');
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;