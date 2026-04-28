import axios from 'axios';

// Create axios instance with default config
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
    const url = originalRequest.url || '';
    
    console.log(`API Error: ${error.response?.status} for ${url}`, error.response?.data);
    
    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('401 Unauthorized error, attempting token refresh...');
      originalRequest._retry = true;
      
      // For certain endpoints, don't attempt refresh (like /auth/refresh itself)
      if (url.includes('/auth/refresh')) {
        console.log('Refresh token endpoint failed, clearing tokens');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('companyId');
        localStorage.removeItem('user');
        localStorage.removeItem('hrms_role');
        localStorage.removeItem('hrms_token');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('Attempting to refresh token...');
          // Call refresh token endpoint
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
            { refresh_token: refreshToken }
          );
          
          const { access_token, refresh_token } = response.data.data;
          
          // Update tokens in storage
          localStorage.setItem('accessToken', access_token);
          localStorage.setItem('refreshToken', refresh_token);
          
          // Update the original request header
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          console.log('Token refreshed successfully, retrying original request');
          // Retry the original request
          return axiosClient(originalRequest);
        } else {
          console.log('No refresh token available');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Don't immediately clear tokens for superadmin endpoints
        // Only clear tokens if it's not a protected admin endpoint
        if (!url.includes('/companies') && !url.includes('/users') && !url.includes('/company-users')) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('companyId');
          localStorage.removeItem('user');
          localStorage.removeItem('hrms_role');
          localStorage.removeItem('hrms_token');
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        } else {
          console.log('Keeping tokens for admin endpoint 401 error');
        }
      }
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      console.error('Permission denied for URL:', url);
    }
    
    if (error.response?.status === 404) {
      console.error('Endpoint not found:', url);
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
